import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {ObservableFormValue} from "../../util/ObservableFormValue";
import {notEmptyFieldValidator, positiveIntegerValidator} from "../../util/validation";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {makeApiPath} from "../../util/network_util";
import {ApplicationStore} from "../../store/ApplicationStore";
import {handleServerError} from "../../util/error_util";
import {format} from "date-fns";

export class CreateAuctionStore {
  readonly title: ObservableFormValue
  readonly category: ObservableFormValue<number | null>
  readonly endDate: ObservableFormValue<Date | null>
  readonly description: ObservableFormValue
  readonly reserve: ObservableFormValue
  readonly photo: ObservableFormValue<File | null>

  readonly categories: AuctionCategoriesStore

  saveAuctionStatus: LoadStatus = new LoadStatusNotYetAttempted()
  saveAuctionPhotoStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeObservable(this, {
      saveAuctionStatus: observable,
      saveAuctionPhotoStatus: observable,

      isLoading: computed,

      validateAndSubmit: action
    })

    this.categories = new AuctionCategoriesStore()

    this.title = new ObservableFormValue<string>("", notEmptyFieldValidator)
    this.category = new ObservableFormValue<number | null>(null, this.categoryIdValidator.bind(this))
    this.endDate = new ObservableFormValue<Date | null>(null, this.dateValidator.bind(this))
    this.description = new ObservableFormValue<string>("", notEmptyFieldValidator)
    this.reserve = new ObservableFormValue<string>("1", positiveIntegerValidator)
    this.photo = new ObservableFormValue<File | null>(null, this.photoValidator.bind(this))
  }

  protected dateValidator(value: Date | null): string | null {
    if (value === null) {
      return "An end date is required"
    }
    else if (value < new Date()) {
      return "Please choose a date in the future"
    }
    return null
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

  protected photoValidator(value: File | null): string | null {
    console.log(value)
    if (value === null) {
      return "A photo is required."
    }
    return null
  }

  get isLoading(): boolean {
    return this.categories.isLoading
      || this.saveAuctionStatus instanceof LoadStatusPending
      || this.saveAuctionPhotoStatus instanceof LoadStatusPending
  }

  protected async createAuction(): Promise<number | null> {
    if (this.saveAuctionStatus instanceof LoadStatusPending) {
      return null
    }

    this.saveAuctionStatus = new LoadStatusPending()
    try {
      const res = await fetch(makeApiPath("/auctions"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify({
          title: this.title.value,
          description: this.description.value,
          categoryId: this.category.value,
          endDate: format(this.endDate.value!, "yyyy-MM-dd HH:mm:ss.SSS"),
          reserve: parseInt(this.reserve.value, 10)
        })
      })

      if (!res.ok) {
        handleServerError(res)
        return null
      }

      const body = await res.json()
      runInAction(() => {
        this.saveAuctionStatus = new LoadStatusDone()
      })
      return body.auctionId
    }
    catch (e) {
      runInAction(() => {
        this.saveAuctionStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  protected async uploadPhoto(auctionId: number) {
    if (this.saveAuctionPhotoStatus instanceof LoadStatusPending) {
      return
    }

    const photo = this.photo.value!
    runInAction(() => {
      this.saveAuctionPhotoStatus = new LoadStatusPending()
    })

    try {
      const res = await fetch(makeApiPath(`/auctions/${auctionId}/image`), {
        method: 'PUT',
        headers: {
          'Content-Type': photo.type,
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: await photo.arrayBuffer()
      })

      if (!res.ok) {
        handleServerError(res)
        return
      }

      runInAction(() => {
        this.saveAuctionPhotoStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.saveAuctionPhotoStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async validateAndSubmit(): Promise<number | null> {
    const invalid = [this.title, this.category, this.endDate, this.description, this.reserve, this.photo].map(f => f.validate()).includes(false)

    if (invalid) {
      return null
    }

    const auctionId = await this.createAuction()
    if (auctionId !== null) {
      // Attempt to save the profile photo.
      try {
        await this.uploadPhoto(auctionId)
      }
      catch (e) {
        alert("Auction creation succeeded uploading the photo failed. Please try again later.")
      }
    }
    return auctionId
  }
}