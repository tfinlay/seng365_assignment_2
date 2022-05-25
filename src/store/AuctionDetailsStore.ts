import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {makeApiPath} from "../util/network_util";
import parseISO from "date-fns/parseISO";
import {handleServerError} from "../util/error_util";

interface AuctionDetails {
  auctionId: number
  title: string
  categoryId: number
  sellerId: number
  sellerFirstName: string
  sellerLastName: string
  reserve: number
  numBids: number
  highestBid: number | null
  endDate: string
  description: string
}

export class AuctionDetailsStore {
  readonly auctionId: number

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()
  auction: AuctionDetails | null = null

  constructor(auctionId: number) {
    makeObservable(this, {
      loadStatus: observable,
      auction: observable,

      isLoading: computed,
      endDate: computed,

      fetchDetails: action
    })

    this.auctionId = auctionId
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  get auctionDoesNotExist(): boolean {
    return this.loadStatus instanceof LoadStatusDone && this.auction === null
  }

  get endDate(): Date | null {
    if (this.auction === null) {
      return null
    }
    else {
      return parseISO(this.auction.endDate)
    }
  }

  async fetchDetails() {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/auctions/${this.auctionId}`))

      if (res.status === 404) {
        runInAction(() => {
          this.auction = null
          this.loadStatus = new LoadStatusDone()
        })
      }
      else if (res.ok) {
        const data = await res.json()
        runInAction(() => {
          this.auction = data
          this.loadStatus = new LoadStatusDone()
        })
      }
      else {
        handleServerError(res)
      }
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}