import {AuctionStore} from "../../store/AuctionStore";
import {AuctionViewBidsStore} from "./AuctionViewBidsStore";
import {ApplicationStore} from "../../store/ApplicationStore";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {makeApiPath} from "../../util/network_util";
import {handleServerError} from "../../util/error_util";

export class AuctionViewStore {
  readonly auction: AuctionStore
  readonly bids: AuctionViewBidsStore

  deleteStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(auction: AuctionStore) {
    makeObservable(this, {
      deleteStatus: observable,

      isEditable: computed,
      isDeleting: computed,

      deleteAuction: action
    })

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

  get isDeleting(): boolean {
    return this.deleteStatus instanceof LoadStatusPending
  }

  async deleteAuction(): Promise<boolean> {
    if (this.deleteStatus instanceof LoadStatusPending) {
      return false
    }

    this.deleteStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/auctions/${this.auction.id}`), {
        method: 'DELETE',
        headers: {
          'X-Authorization': ApplicationStore.main.user!.token
        }
      })

      if (!res.ok) {
        handleServerError(res)
        return false
      }

      runInAction(() => {
        this.deleteStatus = new LoadStatusDone()
      })
      return true
    }
    catch (e) {
      runInAction(() => {
        this.deleteStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}