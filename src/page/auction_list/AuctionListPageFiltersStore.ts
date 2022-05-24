import {makeObservable, observable} from "mobx";
import {AuctionListFilters, AuctionListFiltersSortBy, AuctionListFiltersStatus} from "./AuctionListPageStore";

export class AuctionListPageFiltersStore {
  queryString: string = ""
  readonly categoryIds: number[] = observable.array()
  sellerId: number | null = null
  bidderId: number | null = null
  sortBy: AuctionListFiltersSortBy = "CLOSING_SOON"
  status: AuctionListFiltersStatus = "ANY"

  constructor() {
    makeObservable(this, {
      queryString: observable,
      sellerId: observable,
      bidderId: observable,
      sortBy: observable,
      status: observable
    })
  }

  buildFilters(): AuctionListFilters {
    return {
      query: this.queryString,
      categoryIds: Array.from(this.categoryIds),
      sellerId: this.sellerId,
      bidderId: this.bidderId,
      sortBy: this.sortBy,
      status: this.status
    }
  }
}