import {PhotoStore} from "./PhotoStore";

export class AuctionStore {
  readonly id: number

  readonly photo: PhotoStore

  constructor(id: number) {
    this.id = id
    this.photo = new PhotoStore(`/auctions/${this.id}/image`)

    setTimeout(() => {
      this.photo.fetchImage()
    }, 0)
  }
}