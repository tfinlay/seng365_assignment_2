import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {makeApiPath} from "../util/network_util";
import {handleServerError} from "../util/error_util";
import {ApplicationStore} from "./ApplicationStore";

export class UserProfileDetailsStore {
  readonly userId: number

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  firstName: string | null = null
  lastName: string | null = null
  email: string | null = null

  constructor(userId: number) {
    makeObservable(this, {
      loadStatus: observable,
      firstName: observable,
      lastName: observable,
      email: observable,

      isLoading: computed,
      hasDetails: computed,

      fetchDetails: action
    })

    this.userId = userId
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  get hasDetails(): boolean {
    return this.firstName !== null
  }

  async fetchDetails(): Promise<void> {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/users/${this.userId}`), (ApplicationStore.main.isLoggedIn) ? {
        headers: {
          'X-Authorization': ApplicationStore.main.user!.token
        }
      } : {})

      if (res.status === 404) {
        runInAction(() => {
          this.firstName = null
          this.lastName = null
          this.email = null
          this.loadStatus = new LoadStatusDone()
        })
      }
      else if (res.ok) {
        const data = await res.json()
        runInAction(() => {
          this.firstName = data.firstName
          this.lastName = data.lastName
          this.email = data.email ?? null

          this.loadStatus = new LoadStatusDone()
        })
      }
      else {
        handleServerError(res)
      }
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}