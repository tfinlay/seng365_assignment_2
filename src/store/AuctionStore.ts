import {PhotoStore} from "./PhotoStore";
import {AuctionDetailsStore} from "./AuctionDetailsStore";
import {action} from "mobx";

export class AuctionStore {
  readonly id: number

  readonly photo: PhotoStore
  readonly details: AuctionDetailsStore

  constructor(id: number) {
    this.id = id
    this.photo = new PhotoStore(`/auctions/${this.id}/image`)
    this.details = new AuctionDetailsStore(this.id)

    this.photo.fetchImage()
    this.details.fetchDetails()
  }
}