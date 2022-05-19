import {ObservableFormValue} from "../../util/ObservableFormValue";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../util/LoadStatus";
import {makeApiPath} from "../../util/network_util";
import {ServerError} from "../../util/ServerError";
import {ApplicationStore} from "../../store/ApplicationStore";
import {emailFieldValidator, notEmptyFieldValidator} from "../../util/validation";

export enum RegisterStoreSaveStep {
  REGISTER = "register",
  LOG_IN = "log_in",
  UPLOAD_PROFILE_PICTURE = "upload_profile_picture",
  DONE = "done"
}

export class RegisterStore {
  readonly firstName: ObservableFormValue = new ObservableFormValue<string>("", notEmptyFieldValidator)
  readonly lastName: ObservableFormValue = new ObservableFormValue<string>("", notEmptyFieldValidator)
  readonly email: ObservableFormValue = new ObservableFormValue<string>("", emailFieldValidator)
  readonly password: ObservableFormValue = new ObservableFormValue<string>("", this.passwordFieldValidator.bind(this))

  profilePhoto: File | null = null

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor() {
    makeObservable(this, {
      profilePhoto: observable,
      saveStatus: observable,

      setProfilePhoto: action,
      validateAndSubmit: action,

      hasCustomProfilePhoto: computed,
      isLoading: computed
    })
  }

  protected passwordFieldValidator(value: string) {
    const notEmptyRes = notEmptyFieldValidator(value)
    if (notEmptyRes === null) {
      if (value.length < 6) {
        return "Password must be at least 6 characters long"
      }
    }
    return notEmptyRes
  }

  setProfilePhoto(photo: File | null) {
    this.profilePhoto = photo
  }

  get hasCustomProfilePhoto(): boolean {
    return this.profilePhoto !== null
  }

  protected async submit(): Promise<number | null> {
    if (this.saveStatus instanceof LoadStatusPending) {
      return null
    }

    this.saveStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath("/users/register"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: this.firstName.value,
          lastName: this.lastName.value,
          email: this.email.value,
          password: this.password.value
        })
      })

      if (!res.ok) {
        throw new ServerError(res.statusText)
      }

      runInAction(() => {
        this.saveStatus = new LoadStatusDone()
      })

      return (await res.json()).userId
    }
    catch (e) {
      runInAction(() => {
        this.saveStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async validateAndSubmit(): Promise<number | null> {
    // Validate all the fields
    const invalid = [this.firstName, this.lastName, this.email, this.password].map(f => f.validate()).includes(false)

    if (!invalid) {
      const userId = await this.submit()

      try {
        await ApplicationStore.main.logIn(this.email.value, this.password.value)
      }
      catch (e) {
        alert("Account creation succeeded but logging in and uploading profile photo failed. Please log in manually and try again.")
      }

      if (this.profilePhoto !== null && ApplicationStore.main.isLoggedIn) {
        try {
          await ApplicationStore.main.user!.uploadProfilePhoto(this.profilePhoto)
        }
        catch (e) {
          alert("Profile photo upload failed, but account creation succeeded. Please try again later.")
        }
      }

      return userId
    }
    return null
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
      || ApplicationStore.main.logInStatus instanceof LoadStatusPending
      || ApplicationStore.main.user?.uploadProfileStatus instanceof LoadStatusPending
  }
}