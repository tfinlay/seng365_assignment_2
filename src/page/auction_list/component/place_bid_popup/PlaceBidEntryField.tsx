import React, {useCallback, useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {useAuctionViewStore} from "../../../auction_view/auction_view_store_context";
import {ObservableFormValue} from "../../../../util/ObservableFormValue";
import {action, autorun, computed, makeObservable, observable, runInAction} from "mobx";
import {Box, IconButton, InputAdornment, TextField, Tooltip} from "@mui/material";
import {Cancel, Send} from "@mui/icons-material";
import {AuctionViewBidsStoreBid} from "../../../auction_view/AuctionViewBidsStore";
import {positiveIntegerValidator} from "../../../../util/validation";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../../util/LoadStatus";
import {makeApiPath} from "../../../../util/network_util";
import {ApplicationStore} from "../../../../store/ApplicationStore";
import {handleServerError} from "../../../../util/error_util";
import {ErrorPresenter} from "../../../../component/ErrorPresenter";

class PlaceBidEntryStore {
  readonly amount: ObservableFormValue

  loadStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(initialValue: number) {
    makeObservable(this, {
      loadStatus: observable,

      isLoading: computed,

      validateAndSubmitBid: action
    })

    this.amount = new ObservableFormValue<string>(initialValue.toString(10), positiveIntegerValidator)
  }

  get isLoading(): boolean {
    return this.loadStatus instanceof LoadStatusPending
  }

  protected async submit(auctionId: number) {
    if (this.isLoading) {
      return
    }

    this.loadStatus = new LoadStatusPending()
    try {
      const res = await fetch(makeApiPath(`/auctions/${auctionId}/bids`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify({
          amount: parseInt(this.amount.value, 10)
        })
      })

      if (!res.ok) {
        handleServerError(res)
        return
      }

      runInAction(() => {
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

  async validateAndSubmitBid(auctionId: number): Promise<boolean> {
    if (this.amount.validate()) {
      await this.submit(auctionId)
      return true
    }
    else {
      return false
    }
  }
}

const extraCustomValidator = (value: ObservableFormValue, highestBidSoFar: AuctionViewBidsStoreBid | null, ignoreEditStatus: boolean = false): string | null => {
  const intVal = parseInt(value.value, 10)
  if ((ignoreEditStatus || value.valueEdited) && !isNaN(intVal) && highestBidSoFar !== null) {
    if (intVal <= highestBidSoFar.amount) {
      return "Your bid must beat the highest so far."
    }
  }

  return null
}

interface PlaceBidEntryFieldProps {
  onClose: VoidFunction
}
export const PlaceBidEntryField: React.FC<PlaceBidEntryFieldProps> = observer(({onClose}) => {
  const store = useAuctionViewStore()
  const highestBidSoFar = (store.bids.bids!.length > 0) ? store.bids.bids![0] : null

  const [extraErrorText, setExtraErrorText] = useState<string | null>(null)
  const localStore = useLocalObservable(
    () => new PlaceBidEntryStore((highestBidSoFar?.amount ?? 0) + 1)
  )

  useEffect(() => {
    return autorun(() => {
      setExtraErrorText(extraCustomValidator(localStore.amount, highestBidSoFar))
    })
  }, [localStore.amount, highestBidSoFar])

  const onSubmit = useCallback(async () => {
    if (extraCustomValidator(localStore.amount, highestBidSoFar, true) === null) {
      // Loading time!
      const success = await localStore.validateAndSubmitBid(store.auction.id)

      if (success) {
        store.bids.fetchBids()
        onClose()
      }
    }
  }, [store.auction.id, store.bids, onClose, localStore, highestBidSoFar])

  return (
    <Box sx={{display: 'flex', flexDirection: 'row'}}>
      <Tooltip title='Cancel'>
        <IconButton edge='start' color='error' size='small' sx={{flex: 0}} onClick={onClose} disabled={localStore.isLoading}>
          <Cancel/>
        </IconButton>
      </Tooltip>

      <TextField
        id='PlaceBidEntryField'
        label='Bid Amount ($)'
        variant="outlined"

        sx={{flex: 1}}
        disabled={localStore.isLoading}

        value={localStore.amount.value}
        onChange={(evt) => localStore.amount.setValue(evt.target.value)}
        error={localStore.loadStatus instanceof LoadStatusError || localStore.amount.hasError || (extraErrorText !== null)}
        helperText={(localStore.loadStatus instanceof LoadStatusError)
          ? <>Error: <ErrorPresenter error={localStore.loadStatus.error}/></>
          : localStore.amount.error ?? extraErrorText
        }

        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>$</InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position='end'>
              <Tooltip title='Submit Bid'>
                <IconButton edge='end' color='primary' onClick={onSubmit} disabled={localStore.isLoading}>
                  <Send/>
                </IconButton>
              </Tooltip>
            </InputAdornment>
          )
        }}
      />
    </Box>
  )
})