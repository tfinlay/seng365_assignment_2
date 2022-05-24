/**
 * Store for a single sub-page in the auction list page.
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

export class AuctionListPageStore {
  static readonly PAGE_SIZE = 10

  pageIndex: number
  maxPageIndex: number | null = null

  auctions: AuctionListPageAuction[] | null = null
  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(pageIndex: number) {
    makeObservable(this, {
      pageIndex: observable,
      maxPageIndex: observable,
      loadStatus: observable,
      auctions: observable,

      isLoading: computed,

      nextPage: action,
      prevPage: action,
      reload: action
    })

    this.pageIndex = pageIndex
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async nextPage(filters: AuctionListFilters) {
    let maxPageIndex = (this.maxPageIndex === null) ? Infinity : this.maxPageIndex

    if (this.pageIndex + 1 > maxPageIndex) {
      throw new Error("Already at the next page")
    }
    else {
      this.pageIndex += 1
      await this.fetchCurrentPage(filters)
    }
  }

  async prevPage(filters: AuctionListFilters) {
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
    this.maxPageIndex = null

    await this.fetchCurrentPage(filters)
  }

  protected buildRequestUrlStringForCurrentPage(filters: AuctionListFilters): string {
    const url = new URL(makeApiPath('/auctions'));

    // Pagination
    url.searchParams.set("startIndex", (this.pageIndex * AuctionListPageStore.PAGE_SIZE).toString(10))
    url.searchParams.set("count", AuctionListPageStore.PAGE_SIZE.toString(10))

    // Filters
    url.searchParams.set("q", filters.query)
    for (const categoryId of filters.categoryIds) {
      url.searchParams.append("catgeoryIds", categoryId.toString(10))
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
        this.maxPageIndex = Math.floor(body.count / AuctionListPageStore.PAGE_SIZE)
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