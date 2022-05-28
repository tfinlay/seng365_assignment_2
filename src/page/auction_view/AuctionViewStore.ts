import {AuctionStore} from "../../store/AuctionStore";
import {AuctionViewBidsStore} from "./AuctionViewBidsStore";
import {ApplicationStore} from "../../store/ApplicationStore";

export class AuctionViewStore {
  readonly auction: AuctionStore
  readonly bids: AuctionViewBidsStore

  constructor(auction: AuctionStore) {
    this.auction = auction
    this.bids = new AuctionViewBidsStore(this.auction.id)

    this.bids.fetchBids()
  }

  get isEditable(): boolean {
    if (!ApplicationStore.main.isLoggedIn) {
      return false
    }
    else if (
      this.auction.details.auction === null
      || ApplicationStore.main.user!.id !== this.auction.details.auction!.sellerId
    ) {
      return false
    }

    const numBidsAuction = this.auction.details.auction.numBids
    const numBidsBids = this.bids.bids?.length

    return (numBidsAuction + (numBidsBids ?? 0)) === 0
  }
}