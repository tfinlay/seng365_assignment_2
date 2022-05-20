import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {action, makeObservable, observable, runInAction} from "mobx";
import {makeApiPath} from "../util/network_util";
import {UserProfilePhotoStore} from "./UserProfilePhotoStore";
import {handleServerError} from "../util/error_util";
import {UserProfileDetailsStore} from "./UserProfileDetailsStore";

export class UserStore {
  readonly id: number

  readonly profilePhoto: UserProfilePhotoStore
  readonly profileDetails: UserProfileDetailsStore

  get isEditable() {
    return false
  }

  updateProfilePhotoStatus: LoadStatus = new LoadStatusNotYetAttempted()
  updateProfileDetailsStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(id: number) {
    makeObservable(this, {
      updateProfilePhotoStatus: observable,
      updateProfileDetailsStatus: observable
    })

    this.id = id
    this.profilePhoto = new UserProfilePhotoStore(this.id)
    this.profileDetails = new UserProfileDetailsStore(this.id)

    this.profilePhoto.fetchImage()
    this.profileDetails.fetchDetails()
  }

}

export class CurrentUserStore extends UserStore {
  readonly token: string

  get isEditable(): boolean {
    return true
  }

  constructor(id: number, token: string) {
    super(id)

    makeObservable(this, {
      uploadProfilePhoto: action,
      deleteProfilePhoto: action
    })

    this.token = token
  }

  async uploadProfilePhoto(photo: File) {
    if (this.updateProfilePhotoStatus instanceof LoadStatusPending) {
      return
    }

    this.updateProfilePhotoStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/users/${this.id}/image`), {
        method: 'PUT',
        headers: {
          'X-Authorization': this.token,
          'Content-Type': photo.type
        },
        body: await photo.arrayBuffer()
      })

      if (!res.ok) {
        handleServerError(res)
      }

      runInAction(() => {
        this.updateProfilePhotoStatus = new LoadStatusDone()
        this.profilePhoto.fetchImage()  // Explicitly don't await it here
      })
    }
    catch (e) {
      runInAction(() => {
        this.updateProfilePhotoStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async deleteProfilePhoto() {
    if (this.updateProfilePhotoStatus instanceof LoadStatusPending) {
      return
    }

    this.updateProfilePhotoStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/users/${this.id}/image`), {
        method: 'DELETE',
        headers: {
          'X-Authorization': this.token,
        }
      })

      if (!res.ok) {
        handleServerError(res)
      }

      runInAction(() => {
        this.updateProfilePhotoStatus = new LoadStatusDone()
        this.profilePhoto.fetchImage()  // Explicitly don't await it here
      })
    }
    catch (e) {
      runInAction(() => {
        this.updateProfilePhotoStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}