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

export class UserStore {
  readonly id: number
  readonly token: string

  readonly profilePhoto: UserProfilePhotoStore

  updateProfilePhotoStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(id: number, token: string) {
    this.id = id
    this.token = token
    this.profilePhoto = new UserProfilePhotoStore(this.id)

    makeObservable(this, {
      updateProfilePhotoStatus: observable,

      uploadProfilePhoto: action,
      deleteProfilePhoto: action
    })

    this.profilePhoto.fetchImage()
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