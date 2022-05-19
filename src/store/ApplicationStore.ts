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
  logInOutStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeAutoObservable(this)
  }

  get isLoggedIn(): boolean {
    return this.user !== null
  }

  async logIn(email: string, password: string): Promise<void> {
    if (this.logInOutStatus instanceof LoadStatusPending) {
      console.warn("Attempting to log in while still loading login/logout request.")
      return
    }
    if (this.isLoggedIn) {
      throw new Error("Please log out before attempting to log in again.")
    }

    this.logInOutStatus = new LoadStatusPending()

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
        this.logInOutStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.logInOutStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async logOut(): Promise<void> {
    if (this.logInOutStatus instanceof LoadStatusPending) {
      console.warn("Attempting to log out while still loading login/logout request.")
      return
    }
    if (!this.isLoggedIn) {
      throw new Error("Please log in before attempting to log out.")
    }

    this.logInOutStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath("/users/logout"), {
        method: 'POST',
        headers: {
          'X-Authorization': this.user!.token
        },
      })

      if (!res.ok && res.status !== 401) {
        // The request failed, and it isn't because our token has already expired.
        throw new ServerError(res.statusText)
      }

      runInAction(() => {
        this.user = null
        this.logInOutStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.logInOutStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}