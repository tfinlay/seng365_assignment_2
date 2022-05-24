/**
 * Store for the auction list page.
 */
import {AuctionListPageStore} from "./AuctionListPageStore";
import {AuctionListPageFiltersStore} from "./AuctionListPageFiltersStore";
import {computed, makeObservable} from "mobx";

export class AuctionListStore {
  readonly page: AuctionListPageStore
  readonly filters: AuctionListPageFiltersStore

  constructor() {
    makeObservable(this, {
      isLoading: computed
    })

    this.page = new AuctionListPageStore(0)
    this.filters = new AuctionListPageFiltersStore()

    this.page.reload(this.filters.buildFilters())
  }

  get isLoading(): boolean {
    return this.page.isLoading
  }

  async reload() {
    await this.page.reload(this.filters.buildFilters())
  }
}