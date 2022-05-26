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
import {computed, makeObservable} from "mobx";
import {AuctionDetails} from "../../store/AuctionDetailsStore";

export class AuctionViewSimilarStore implements AuctionSupplier {
  readonly auction: AuctionDetails
  readonly sameSeller: AuctionListPageStore
  readonly sameCategory: AuctionListPageStore

  constructor(auction: AuctionDetails) {
    makeObservable(this, {
      sameSellerFilters: computed,
      auctions: computed,
      loadStatus: computed,
      isLoading: computed
    })

    this.auction = auction
    this.sameSeller = new AuctionListPageStore(0)
    this.sameCategory = new AuctionListPageStore(0)

    this.sameSeller.reload(this.sameSellerFilters)
    this.sameCategory.reload(this.sameCategoryFilters)
  }

  get sameSellerFilters(): AuctionListFilters {
    return {
      query: "",
      categoryIds: [],
      sellerId: this.auction.sellerId,
      bidderId: null,
      sortBy: "CLOSING_SOON",
      status: "ANY"
    }
  }

  get sameCategoryFilters(): AuctionListFilters {
    return {
      query: "",
      categoryIds: [this.auction.categoryId],
      sellerId: null,
      bidderId: null,
      sortBy: "CLOSING_SOON",
      status: "ANY"
    }
  }

  get auctions(): AuctionListPageAuction[] | null {
    if (this.sameCategory.auctions === null || this.sameSeller.auctions === null) {
      return null
    }
    else {
      return uniqBy(
        [...this.sameCategory.auctions, ...this.sameSeller.auctions],
        (auction) => auction.auction.auctionId
      )
        .filter(auction => auction.auction.auctionId !== this.auction.auctionId)
    }
  }

  get loadStatus(): LoadStatus {
    if (this.sameSeller.isLoading || this.sameCategory.isLoading) {
      return this.sameSeller.loadStatus
    }
    else if (this.sameSeller.loadStatus instanceof LoadStatusError) {
      return this.sameSeller.loadStatus
    }
    else if (this.sameCategory.loadStatus instanceof LoadStatusError) {
      return this.sameCategory.loadStatus
    }
    else if (this.sameSeller.loadStatus instanceof LoadStatusDone && this.sameCategory.loadStatus instanceof LoadStatusDone) {
      return this.sameCategory.loadStatus
    }
    else {
      return new LoadStatusNotYetAttempted()
    }
  }

  get isLoading(): boolean {
    return this.sameSeller.isLoading || this.sameCategory.isLoading
  }
}