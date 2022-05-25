import {makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {makeApiPath} from "../../util/network_util";
import {handleServerError} from "../../util/error_util";
import parseISO from "date-fns/parseISO";

interface ServerBid {
  bidderId: number
  amount: number
  firstName: number
  lastName: number
  timestamp: string
}

export interface AuctionViewBidsStoreBid extends Omit<ServerBid, 'timestamp'> {
  timestamp: Date
}

export class AuctionViewBidsStore {
  readonly auctionId: number

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()
  bids: AuctionViewBidsStoreBid[] | null = null

  constructor(auctionId: number) {
    makeObservable(this, {
      loadStatus: observable,
      bids: observable
    })

    this.auctionId = auctionId
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  async fetchBids() {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/auctions/${this.auctionId}/bids`))

      if (!res.ok) {
        handleServerError(res)
        return
      }

      const body: ServerBid[] = await res.json()
      runInAction(() => {
        this.bids = body.map((bid) => ({
          ...bid,
          timestamp: parseISO(bid.timestamp)
        }))
        this.loadStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.loadStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}