import {AuctionStore} from "../../store/AuctionStore";

export class AuctionViewStore {
  readonly auction: AuctionStore

  constructor(auction: AuctionStore) {
    this.auction = auction
  }
}