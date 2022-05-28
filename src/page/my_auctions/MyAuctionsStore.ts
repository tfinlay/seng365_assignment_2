import {
  AuctionListFilters,
  AuctionListFiltersSortBy, AuctionListFiltersStatus,
  AuctionListPageStore,
  AuctionSupplier
} from "../auction_list/AuctionListPageStore";
import {AuctionStore} from "../../store/AuctionStore";
import {AuctionListPageAuction} from "../auction_list/AuctionListPageAuction";
import {uniqBy} from "lodash";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted
} from "../../util/LoadStatus";
import {computed, makeObservable, observable} from "mobx";
import {AuctionDetails} from "../../store/AuctionDetailsStore";
import {ApplicationStore} from "../../store/ApplicationStore";
import {PageableAuctionStore, PageableAuctionStorePage} from "../../component/auction/pagination/PageableAuctionStore";

export class MyAuctionsStore implements AuctionSupplier, PageableAuctionStore, PageableAuctionStorePage {
  readonly myAuctions: AuctionListPageStore
  readonly myBids: AuctionListPageStore

  readonly page: PageableAuctionStorePage

  pageIndex: number = 0

  constructor() {
    makeObservable(this, {
      pageIndex: observable,

      myAuctionsFilters: computed,
      auctions: computed,
      loadStatus: computed,
      isLoading: computed
    })

    this.page = this
    this.myAuctions = new AuctionListPageStore(0)
    this.myBids = new AuctionListPageStore(0)

    this.myAuctions.reload(this.myAuctionsFilters)
    this.myBids.reload(this.myBidsFilters)
  }

  get myAuctionsFilters(): AuctionListFilters {
    return {
      query: "",
      categoryIds: [],
      sellerId: ApplicationStore.main.user!.id,
      bidderId: null,
      sortBy: "CLOSING_SOON",
      status: "ANY"
    }
  }

  get myBidsFilters(): AuctionListFilters {
    return {
      query: "",
      categoryIds: [],
      sellerId: null,
      bidderId: ApplicationStore.main.user!.id,
      sortBy: "CLOSING_SOON",
      status: "ANY"
    }
  }

  get auctions(): AuctionListPageAuction[] | null {
    if (this.myAuctions.auctions === null || this.myBids.auctions === null) {
      return null
    }
    else {
      const auctionsArr = []
      if (this.myAuctions.pageIndex === this.pageIndex) {
        auctionsArr.push(...this.myAuctions.auctions)
      }
      if (this.myBids.pageIndex === this.pageIndex) {
        auctionsArr.push(...this.myBids.auctions)
      }

      return auctionsArr
    }
  }

  get loadStatus(): LoadStatus {
    if (this.myAuctions.isLoading || this.myBids.isLoading) {
      return this.myAuctions.loadStatus
    }
    else if (this.myAuctions.loadStatus instanceof LoadStatusError) {
      return this.myAuctions.loadStatus
    }
    else if (this.myBids.loadStatus instanceof LoadStatusError) {
      return this.myBids.loadStatus
    }
    else if (this.myAuctions.loadStatus instanceof LoadStatusDone && this.myBids.loadStatus instanceof LoadStatusDone) {
      return this.myBids.loadStatus
    }
    else {
      return new LoadStatusNotYetAttempted()
    }
  }

  get isLoading(): boolean {
    return this.myAuctions.isLoading || this.myBids.isLoading
  }

  /// PageableAuctionStore
  async goToFirstPage(): Promise<void> {
    this.pageIndex = 0
    await Promise.all([
      this.myAuctions.goToFirstPage(this.myAuctionsFilters),
      this.myBids.goToFirstPage(this.myBidsFilters)
    ])
  }

  async goToLastPage(): Promise<void> {
    const lastPage = this.maxPageIndex
    if (lastPage === null) {
      throw new Error("Last page is unknown")
    }

    this.pageIndex = lastPage

    const promises = []

    if (this.myAuctions.maxPageIndex === this.pageIndex) {
      promises.push(this.myAuctions.goToLastPage(this.myAuctionsFilters))
    }
    if (this.myBids.maxPageIndex === this.pageIndex) {
      promises.push(this.myBids.goToLastPage(this.myBidsFilters))
    }

    await Promise.all(promises)
  }

  async goToPrevPage(): Promise<void> {
    if (this.pageIndex === 0) {
      throw new Error("Already at first page")
    }
    else {
      const promises = []

      if (this.myAuctions.pageIndex === this.pageIndex) {
        promises.push(this.myAuctions.goToPrevPage(this.myAuctionsFilters))
      }
      if (this.myBids.pageIndex === this.pageIndex) {
        promises.push(this.myBids.goToPrevPage(this.myBidsFilters))
      }

      this.pageIndex -= 1

      await Promise.all(promises)
    }
  }

  async goToNextPage(): Promise<void> {
    const maxPageIndex = (this.maxPageIndex === null) ? Infinity : this.maxPageIndex

    if (this.pageIndex + 1 > maxPageIndex) {
      throw new Error("Already at the last page")
    }
    else {
      this.pageIndex += 1

      const promises = []
      if ((this.myAuctions.maxPageIndex ?? Infinity) >= this.pageIndex) {
        promises.push(this.myAuctions.goToNextPage(this.myAuctionsFilters))
      }
      if ((this.myBids.maxPageIndex ?? Infinity) >= this.pageIndex) {
        promises.push(this.myBids.goToNextPage(this.myBidsFilters))
      }

      await Promise.all(promises)
    }
  }

  /// PageableAuctionStorePage
  get pageSize(): number {
    return this.myBids.pageSize + this.myAuctions.pageSize
  }

  get totalResultCount(): number | null {
    if (this.isLoading) {
      return null
    }
    else {
      return this.myAuctions.totalResultCount! + this.myBids.totalResultCount!
    }
  }

  get auctionCount(): number | null {
    let count = 0
    if (this.pageIndex === this.myBids.pageIndex) {
      if (this.myBids.auctionCount === null) {
        return null
      }
      count += this.myBids.auctionCount
    }
    if (this.pageIndex === this.myAuctions.pageIndex) {
      if (this.myAuctions.auctionCount === null) {
        return null
      }
      count += this.myAuctions.auctionCount
    }
    return count
  }

  get maxPageIndex(): number | null {
    if (this.isLoading) {
      return null
    }
    return Math.max(this.myAuctions.maxPageIndex!, this.myBids.maxPageIndex!)
  }
}