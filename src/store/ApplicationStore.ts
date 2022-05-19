import {UserStore} from "./UserStore";
import {makeAutoObservable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {makeApiPath} from "../util/network_util";
import {ServerError} from "../util/ServerError";

export class ApplicationStore {
  static readonly main = new ApplicationStore()

  user: UserStore | null = null
  logInStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeAutoObservable(this)
  }

  get isLoggedIn(): boolean {
    return this.user !== null
  }

  async logIn(email: string, password: string): Promise<void> {
    if (this.logInStatus instanceof LoadStatusPending) {
      return
    }
    if (this.isLoggedIn) {
      throw new Error("Please log out before attempting to log in again.")
    }

    this.logInStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath("/users/login"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
      })

      if (!res.ok) {
        throw new ServerError(res.statusText)
      }

      const {userId, token} = await res.json()

      runInAction(() => {
        this.user = new UserStore(userId, token)
        this.logInStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.logInStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}