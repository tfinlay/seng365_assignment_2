import {action, makeObservable, observable} from "mobx";
import {AuctionListFilters, AuctionListFiltersSortBy, AuctionListFiltersStatus} from "./AuctionListPageStore";

export class AuctionListPageFiltersStore {
  queryString: string = ""
  categoryIds: number[] = []
  sellerId: number | null = null
  bidderId: number | null = null
  sortBy: AuctionListFiltersSortBy = "CLOSING_SOON"
  status: AuctionListFiltersStatus = "ANY"

  constructor() {
    makeObservable(this, {
      queryString: observable,
      categoryIds: observable,
      sellerId: observable,
      bidderId: observable,
      sortBy: observable,
      status: observable,

      clear: action,
      setQueryString: action,
      setCategoryIds: action,
      setSellerId: action,
      setBidderId: action,
      setSortBy: action,
      setStatus: action
    })
  }


  buildFilters(): AuctionListFilters {
    return {
      query: this.queryString,
      categoryIds: this.categoryIds,
      sellerId: this.sellerId,
      bidderId: this.bidderId,
      sortBy: this.sortBy,
      status: this.status
    }
  }

  clear() {
    this.queryString = ""
    this.categoryIds = []
    this.sellerId = null
    this.bidderId = null
    this.sortBy = "CLOSING_SOON"
    this.status = "ANY"
  }

  setQueryString(newValue: string) {
    this.queryString = newValue
  }

  setCategoryIds(newValue: number[]) {
    this.categoryIds = newValue
  }

  setSellerId(newValue: number | null) {
    this.sellerId = newValue
  }

  setBidderId(newValue: number | null) {
    this.bidderId = newValue
  }

  setSortBy(newValue: AuctionListFiltersSortBy) {
    this.sortBy = newValue
  }

  setStatus(newValue: AuctionListFiltersStatus) {
    this.status = newValue
  }
}