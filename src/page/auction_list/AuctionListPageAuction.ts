import parseISO from "date-fns/parseISO";
import {PhotoStore} from "../../store/PhotoStore";

export interface IAuctionListPageAuction {
  title: string,
  categoryId: number,
  sellerId: number,
  reserve: number,
  endDate: string,
  auctionId: number,
  sellerFirstName: string,
  sellerLastName: string,
  highestBid: number,
  numBids: number
}

export class AuctionListPageAuction {
  readonly auction: IAuctionListPageAuction
  readonly photo: PhotoStore

  readonly endDate: Date

  constructor(data: IAuctionListPageAuction) {
    this.auction = data
    this.endDate = parseISO(data.endDate)
    this.photo = new PhotoStore(`/auctions/${data.auctionId}/image`)

    this.photo.fetchImage()
  }

}