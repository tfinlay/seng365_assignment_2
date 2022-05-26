import {AuctionStore} from "../../store/AuctionStore";
import {AuctionViewBidsStore} from "./AuctionViewBidsStore";

export class AuctionViewStore {
  readonly auction: AuctionStore
  readonly bids: AuctionViewBidsStore

  constructor(auction: AuctionStore) {
    this.auction = auction
    this.bids = new AuctionViewBidsStore(this.auction.id)

    this.bids.fetchBids()
  }
}