import {CurrentUserStore, UserStore} from "./UserStore";
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
  static readonly main = new ApplicationStore("application-store-main")

  user: CurrentUserStore | null = null
  logInOutStatus: LoadStatus = new LoadStatusNotYetAttempted()

  protected readonly localStoragePrefix: string

  protected constructor(localStoragePrefix: string) {
    makeAutoObservable(this)

    this.localStoragePrefix = localStoragePrefix


    const storedUserInfo = this.getLocalStorageUserInfo()
    if (storedUserInfo !== null) {
      // TODO: Should we verify that the token is still valid?
      this.user = new CurrentUserStore(storedUserInfo.userId, storedUserInfo.token)
    }
  }

  protected getLocalStorageUserInfo(): {userId: number, token: string} | null {
    const userIdStr = window.localStorage.getItem(`${this.localStoragePrefix}-userId`)
    const token = window.localStorage.getItem(`${this.localStoragePrefix}-token`)

    if (userIdStr === null || token === null) {
      return null
    }

    const userId = parseInt(userIdStr, 10)

    if (isNaN(userId)) {
      return null
    }

    return {userId, token}
  }

  protected saveUserInfoToLocalStorage(): void {
    if (this.user === null) {
      window.localStorage.removeItem(`${this.localStoragePrefix}-userId`)
      window.localStorage.removeItem(`${this.localStoragePrefix}-token`)
    }
    else {
      window.localStorage.setItem(`${this.localStoragePrefix}-userId`, this.user.id.toString(10))
      window.localStorage.setItem(`${this.localStoragePrefix}-token`, this.user.token)
    }

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
        this.user = new CurrentUserStore(userId, token)
        this.logInOutStatus = new LoadStatusDone()
        this.saveUserInfoToLocalStorage()
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
        this.saveUserInfoToLocalStorage()
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