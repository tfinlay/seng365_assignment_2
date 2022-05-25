import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {makeApiPath} from "../util/network_util";
import {handleServerError} from "../util/error_util";

type GetCategoriesResponseBody = {
  categoryId: number
  name: string
}[]

export class AuctionCategoriesStore {
  categoriesById: Map<number, string> | null = null
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeObservable(this, {
      loadStatus: observable,
      categoriesById: observable,

      isLoading: computed,

      fetchCategories: action
    })

    this.fetchCategories()
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async fetchCategories() {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    this.categoriesById = null

    try {
      const res = await fetch(makeApiPath(`/auctions/categories`))

      if (!res.ok) {
        handleServerError(res)
      }

      const data: GetCategoriesResponseBody = await res.json()

      runInAction(() => {
        this.categoriesById = observable.map()
        for (const {categoryId, name} of data) {
          this.categoriesById.set(categoryId, name)
        }
        this.loadStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}