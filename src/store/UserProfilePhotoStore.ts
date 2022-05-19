import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {makeApiPath} from "../util/network_util";
import {ServerError} from "../util/ServerError";

export class UserProfilePhotoStore {
  readonly userId: number

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()
  imageData: Blob | null = null

  constructor(userId: number) {
    makeObservable(this, {
      loadStatus: observable,
      imageData: observable,

      isLoading: computed,
      hasImage: computed,

      fetchImage: action
    })

    this.userId = userId
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  get hasImage(): boolean {
    return this.imageData !== null
  }

  async fetchImage(): Promise<void> {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/users/${this.userId}/image`))

      if (res.status === 404) {
        runInAction(() => {
          this.imageData = null
          this.loadStatus = new LoadStatusDone()
        })
      }
      else if (res.ok) {
        const data = await res.blob()
        runInAction(() => {
          this.imageData = data
          this.loadStatus = new LoadStatusDone()
        })
      }
      else {
        throw new ServerError(res.statusText)
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