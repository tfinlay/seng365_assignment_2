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

export class PhotoStore {
  readonly apiPath: string

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()
  imageData: Blob | null = null

  constructor(apiPath: string) {
    makeObservable(this, {
      loadStatus: observable,
      imageData: observable,

      isLoading: computed,
      hasImage: computed,

      fetchImage: action
    })

    this.apiPath = apiPath
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
      const res = await fetch(makeApiPath(this.apiPath))

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