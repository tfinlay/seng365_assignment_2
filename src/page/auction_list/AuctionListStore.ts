/**
 * Store for the auction list page.
 */
import {AuctionListPageStore} from "./AuctionListPageStore";
import {AuctionListPageFiltersStore} from "./AuctionListPageFiltersStore";
import {computed, makeObservable} from "mobx";
import {AuctionListCategoriesStore} from "./AuctionListCategoriesStore";

export class AuctionListStore {
  readonly page: AuctionListPageStore
  readonly filters: AuctionListPageFiltersStore
  readonly categories: AuctionListCategoriesStore

  constructor() {
    makeObservable(this, {
      isLoading: computed
    })

    this.page = new AuctionListPageStore(0)
    this.filters = new AuctionListPageFiltersStore()
    this.categories = new AuctionListCategoriesStore()

    this.categories.fetchCategories()
    this.page.reload(this.filters.buildFilters())

    // @ts-ignore
    window.reloadCategories = () => this.categories.fetchCategories()
  }

  get isLoading(): boolean {
    return this.page.isLoading || this.categories.isLoading
  }

  async reloadPage() {
    await this.page.reload(this.filters.buildFilters())
  }
}