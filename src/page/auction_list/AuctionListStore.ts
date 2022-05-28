/**
 * Store for the auction_view list page.
 */
import {AuctionListPageStore} from "./AuctionListPageStore";
import {AuctionListPageFiltersStore} from "./AuctionListPageFiltersStore";
import {action, computed, makeObservable} from "mobx";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {PageableAuctionStore} from "../../component/auction/pagination/PageableAuctionStore";

export class AuctionListStore implements PageableAuctionStore {
  readonly page: AuctionListPageStore
  readonly filters: AuctionListPageFiltersStore

  constructor() {
    makeObservable(this, {
      isLoading: computed,

      reloadPage: action,
      goToNextPage: action,
      goToPrevPage: action,
      goToFirstPage: action,
      goToLastPage: action
    })

    this.page = new AuctionListPageStore(0)
    this.filters = new AuctionListPageFiltersStore()

    this.page.reload(this.filters.buildFilters())
  }

  get isLoading(): boolean {
    return this.page.isLoading
  }

  async reloadPage() {
    await this.page.reload(this.filters.buildFilters())
  }

  async goToNextPage() {
    await this.page.goToNextPage(this.filters.buildFilters())
  }

  async goToPrevPage() {
    await this.page.goToPrevPage(this.filters.buildFilters())
  }

  async goToFirstPage() {
    await this.page.goToFirstPage(this.filters.buildFilters())
  }

  async goToLastPage() {
    await this.page.goToLastPage(this.filters.buildFilters())
  }
}