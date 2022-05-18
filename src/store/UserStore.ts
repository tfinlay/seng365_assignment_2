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

export class UserStore {
  readonly id: number
  readonly token: string

  uploadProfileStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(id: number, token: string) {
    this.id = id
    this.token = token
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