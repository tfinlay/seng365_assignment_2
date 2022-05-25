import {AuctionStore} from "../../store/AuctionStore";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {AuctionViewBidsStore} from "./AuctionViewBidsStore";

export class AuctionViewStore {
  readonly auction: AuctionStore
  readonly categories: AuctionCategoriesStore
  readonly bids: AuctionViewBidsStore

  constructor(auction: AuctionStore) {
    this.auction = auction
    this.categories = new AuctionCategoriesStore()
    this.bids = new AuctionViewBidsStore(this.auction.id)

    this.categories.fetchCategories()
    this.bids.fetchBids()
  }
}