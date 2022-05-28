/**
 * Store for a single sub-page in the auction_view list page.
 */
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {AuctionListPageAuction, IAuctionListPageAuction} from "./AuctionListPageAuction";
import {makeApiPath} from "../../util/network_util";
import {handleServerError} from "../../util/error_util";
import {PageableAuctionStorePage} from "../../component/auction/pagination/PageableAuctionStore";

export type AuctionListFiltersSortBy = `${'ALPHABETICAL' | 'BIDS' | 'RESERVE'}_${'ASC' | 'DESC'}` | `CLOSING_${'SOON'|'LAST'}`
export type AuctionListFiltersStatus = "ANY" | "OPEN" | "CLOSED"

export interface AuctionListFilters {
  query: string
  categoryIds: number[]
  sellerId: number | null
  bidderId: number | null
  sortBy: AuctionListFiltersSortBy
  status: AuctionListFiltersStatus
}

interface AuctionListResult {
  auctions: IAuctionListPageAuction[],
  count: number
}

export interface AuctionSupplier {
  auctions: AuctionListPageAuction[] | null
  loadStatus: LoadStatus
  isLoading: boolean
}

export class AuctionListPageStore implements AuctionSupplier, PageableAuctionStorePage {
  readonly pageSize = 10

  pageIndex: number
  totalResultCount: number | null = null

  auctions: AuctionListPageAuction[] | null = null
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(pageIndex: number) {
    makeObservable(this, {
      pageIndex: observable,
      totalResultCount: observable,
      loadStatus: observable,
      auctions: observable,

      auctionCount: computed,
      maxPageIndex: computed,
      isLoading: computed,

      goToFirstPage: action,
      goToLastPage: action,
      goToNextPage: action,
      goToPrevPage: action,
      reload: action
    })

    this.pageIndex = pageIndex
  }

  get auctionCount(): number | null {
    return this.auctions?.length ?? null
  }

  get maxPageIndex(): number | null {
    if (this.totalResultCount === null) {
      return null
    }
    return Math.ceil(this.totalResultCount / this.pageSize) - 1
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async goToFirstPage(filters: AuctionListFilters) {
    this.pageIndex = 0
    await this.fetchCurrentPage(filters)
  }

  async goToLastPage(filters: AuctionListFilters) {
    if (this.maxPageIndex === null) {
      throw new Error("Last page is not known")
    }
    else {
      this.pageIndex = this.maxPageIndex
      await this.fetchCurrentPage(filters)
    }
  }

  async goToNextPage(filters: AuctionListFilters) {
    const maxPageIndex = (this.maxPageIndex === null) ? Infinity : this.maxPageIndex

    if (this.pageIndex + 1 > maxPageIndex) {
      throw new Error("Already at the last page")
    }
    else {
      this.pageIndex += 1
      await this.fetchCurrentPage(filters)
    }
  }

  async goToPrevPage(filters: AuctionListFilters) {
    if (this.pageIndex === 0) {
      throw new Error("Already at the first page")
    }
    else {
      this.pageIndex -= 1
      await this.fetchCurrentPage(filters)
    }
  }

  async reload(filters: AuctionListFilters) {
    this.pageIndex = 0
    this.totalResultCount = null

    await this.fetchCurrentPage(filters)
  }

  protected buildRequestUrlStringForCurrentPage(filters: AuctionListFilters): string {
    const url = new URL(makeApiPath('/auctions'));

    // Pagination
    url.searchParams.set("startIndex", (this.pageIndex * this.pageSize).toString(10))
    url.searchParams.set("count", this.pageSize.toString(10))

    // Filters
    url.searchParams.set("q", filters.query)
    for (const categoryId of filters.categoryIds) {
      url.searchParams.append("categoryIds", categoryId.toString(10))
    }
    if (filters.sellerId !== null) {
      url.searchParams.set("sellerId", filters.sellerId.toString(10))
    }
    if (filters.bidderId !== null) {
      url.searchParams.set("bidderId", filters.bidderId.toString(10))
    }
    url.searchParams.set("sortBy", filters.sortBy)
    url.searchParams.set("status", filters.status)

    return url.toString()
  }

  protected async fetchCurrentPage(filters: AuctionListFilters) {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    this.auctions = null

    try {
      const res = await fetch(this.buildRequestUrlStringForCurrentPage(filters))

      if (!res.ok) {
        handleServerError(res)
        return
      }

      const body: AuctionListResult = await res.json()

      runInAction(() => {
        this.auctions = body.auctions.map((auction) => new AuctionListPageAuction(auction))
        this.totalResultCount = body.count
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