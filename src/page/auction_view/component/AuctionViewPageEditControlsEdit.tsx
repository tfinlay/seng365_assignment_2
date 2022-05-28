import React, {useCallback, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {Check, Edit} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, LinearProgress,
  Paper,
  Typography
} from "@mui/material";
import {useAuctionViewStore} from "../auction_view_store_context";
import {ObservableFormValue} from "../../../util/ObservableFormValue";
import {futureDateValidator, notEmptyFieldValidator, positiveIntegerValidator} from "../../../util/validation";
import {AuctionCategoriesStore} from "../../../store/AuctionCategoriesStore";
import {AuctionDetailsStore} from "../../../store/AuctionDetailsStore";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {useAuctionCategoriesStore} from "../../../store/auction_categories_store_context";
import {AuctionEditFormStore} from "../../../component/auction/edit/AuctionEditFormStore";
import {AuctionEditFormStoreProvider} from "../../../component/auction/edit/auction_edit_form_store_context";
import {AuctionEditFormBaseFields} from "../../../component/auction/edit/AuctionEditFormBaseFields";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {formatDateForAuction, makeApiPath} from "../../../util/network_util";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {handleServerError} from "../../../util/error_util";


interface ActionPatchBody {
  title?: string
  description?: string
  categoryId?: number
  endDate?: string
  reserve?: number
}

class AuctionViewPageEditControlsEditStore implements AuctionEditFormStore {
  readonly auctionId: number

  readonly title: ObservableFormValue
  readonly category: ObservableFormValue<number | null>
  readonly endDate: ObservableFormValue<Date | null>
  readonly description: ObservableFormValue
  readonly reserve: ObservableFormValue

  readonly categories: AuctionCategoriesStore

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(categories: AuctionCategoriesStore, initialDetails: AuctionDetailsStore) {
    makeObservable(this, {
      saveStatus: observable,

      isLoading: computed,
      isEdited: computed,
      isDone: computed,

      updateAuction: action
    })

    this.auctionId = initialDetails.auctionId
    this.categories = categories

    this.title = new ObservableFormValue<string>(initialDetails.auction!.title, notEmptyFieldValidator)
    this.category = new ObservableFormValue<number | null>(initialDetails.auction!.categoryId, this.categoryIdValidator.bind(this))
    this.endDate = new ObservableFormValue<Date | null>(initialDetails.endDate!, futureDateValidator)
    this.description = new ObservableFormValue<string>(initialDetails.auction!.description, notEmptyFieldValidator)
    this.reserve = new ObservableFormValue<string>(initialDetails.auction!.reserve.toString(10), positiveIntegerValidator)
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
  }

  get isEdited(): boolean {
    return this.title.valueEdited
      || this.category.valueEdited
      || this.endDate.valueEdited
      || this.description.valueEdited
      || this.reserve.valueEdited
  }

  get isDone(): boolean {
    return this.saveStatus instanceof LoadStatusDone
  }

  protected categoryIdValidator(value: number | null): string | null {
    if (value === null) {
      return "A category is required"
    }
    else if (!this.categories.categoriesById?.has(value)) {
      return "Invalid category"
    }
    return null
  }

  protected buildPatchBody(): ActionPatchBody | null {
    let body: ActionPatchBody = {}

    if (this.title.valueEdited) {
      if (this.title.validate()) {
        body.title = this.title.value
      }
      else {
        return null
      }
    }

    if (this.description.valueEdited) {
      if (this.description.validate()) {
        body.description = this.description.value
      }
      else {
        return null
      }
    }

    if (this.category.valueEdited) {
      if (this.category.validate()) {
        body.categoryId = this.category.value!
      }
      else {
        return null
      }
    }

    if (this.endDate.valueEdited) {
      if (this.endDate.validate()) {
        body.endDate = formatDateForAuction(this.endDate.value!)
      }
      else {
        return null
      }
    }

    if (this.reserve.valueEdited) {
      if (this.reserve.validate()) {
        body.reserve = parseInt(this.reserve.value!, 10)
      }
      else {
        return null
      }
    }

    return body
  }

  async updateAuction(): Promise<boolean> {
    if (!this.isEdited) {
      // Nothing to do!
      return true
    }
    else if (this.isLoading) {
      return false
    }

    this.saveStatus = new LoadStatusPending()

    try {
      const body = this.buildPatchBody()

      const res = await fetch(makeApiPath(`/auctions/${this.auctionId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        handleServerError(res)
        return false
      }

      runInAction(() => {
        this.saveStatus = new LoadStatusDone()
      })
      return true
    }
    catch (e) {
      runInAction(() => {
        this.saveStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}

export const AuctionViewPageEditControlsEdit: React.FC = observer(() => {
  const [open, setOpen] = useState<boolean>(false)

  const openPopup = useCallback(() => {
    setOpen(true)
  }, [])

  const closePopup = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      <Button
        sx={{
          flex: 1
        }}
        onClick={openPopup}
      >
        <Edit/>&nbsp;&nbsp;Edit Auction
      </Button>

      {(open) && <AuctionViewPageEditControlsEditPopup onClose={closePopup}/>}
    </>
  )
})

const makeStore = (categories: AuctionCategoriesStore, initialDetails: AuctionDetailsStore) =>
  observable(new AuctionViewPageEditControlsEditStore(categories, initialDetails), {}, {autoBind: true})

interface AuctionViewPageEditControlsEditPopupProps {
  onClose: VoidFunction
}
const AuctionViewPageEditControlsEditPopup: React.FC<AuctionViewPageEditControlsEditPopupProps> = observer(({onClose}) => {
  const store = useAuctionViewStore()
  const categories = useAuctionCategoriesStore()

  const [localStore, setLocalStore] = useState<AuctionViewPageEditControlsEditStore>(() => makeStore(categories, store.auction.details))
  useEffect(() => {
    if (store.auction.id !== localStore.auctionId) {
      setLocalStore(makeStore(categories, store.auction.details))
    }
  }, [localStore.auctionId, store.auction.id])

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()

    if (localStore.isDone) {
      return
    }

    const success = await localStore.updateAuction()

    if (success) {
      setTimeout(() => {
        onClose()
        store.auction.details.fetchDetails()
      }, 750)
    }
  }, [localStore, onClose, store.auction.details])

  const onDialogClose = useCallback(() => {
    if (!localStore.isLoading) {
      onClose()
    }
  }, [localStore.isLoading, onClose])

  return (
    <AuctionEditFormStoreProvider store={localStore}>
      <Dialog open={true} onClose={onDialogClose}>
        {(localStore.isLoading) && <LinearProgress/>}

        {(localStore.isDone) ? (
          <DialogContent>
            <Check color='success' sx={{fontSize: 64}} />
          </DialogContent>
        ) : (
          <form onSubmit={onSubmit}>
            <DialogTitle>Edit Auction</DialogTitle>

            <DialogContent>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1}}>
                <AuctionEditFormBaseFields/>

                {(localStore.saveStatus instanceof LoadStatusError) ? (
                  <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={localStore.saveStatus.error}/></Typography>
                ) : undefined}
              </Box>
            </DialogContent>

            <DialogActions sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button
                sx={{marginLeft: 0}}
                type='button'
                onClick={onDialogClose}
                disabled={localStore.isLoading}
              >
                Cancel
              </Button>

              <Button
                variant='contained'
                type='submit'
                disabled={localStore.isLoading}
              >
                Submit
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>
    </AuctionEditFormStoreProvider>
  )
})