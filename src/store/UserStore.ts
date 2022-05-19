import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../util/LoadStatus";
import {runInAction} from "mobx";
import {makeApiPath} from "../util/network_util";
import {ServerError} from "../util/ServerError";
import {UserProfilePhotoStore} from "./UserProfilePhotoStore";

export class UserStore {
  readonly id: number
  readonly token: string

  readonly profilePhoto: UserProfilePhotoStore

  uploadProfileStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(id: number, token: string) {
    this.id = id
    this.token = token
    this.profilePhoto = new UserProfilePhotoStore(this.id)

    this.profilePhoto.fetchImage()
  }

  async uploadProfilePhoto(photo: File) {
    if (this.uploadProfileStatus instanceof LoadStatusPending) {
      return
    }

    this.uploadProfileStatus = new LoadStatusPending()

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
        throw new ServerError(res.statusText)
      }

      runInAction(() => {
        this.uploadProfileStatus = new LoadStatusDone()
        this.profilePhoto.fetchImage()  // Explicitly don't await it here
      })
    }
    catch (e) {
      runInAction(() => {
        this.uploadProfileStatus = new LoadStatusError(e)
      })
      throw e
    }
  }
}