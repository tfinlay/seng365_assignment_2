import {UserStore} from "../../store/UserStore";
import {ApplicationStore} from "../../store/ApplicationStore";
import {computed, makeObservable} from "mobx";

export class ProfileStore {
  readonly user: UserStore

  constructor(user: UserStore) {
    this.user = user

    makeObservable(this, {
      pageTitle: computed
    })
  }

  get pageTitle(): string {
    return (
      (this.user.id === ApplicationStore.main.user?.id)
        ? "My Profile"
        : (`${
          (this.user.profileDetails?.hasDetails)
            ? `${this.user.profileDetails!.firstName} ${this.user.profileDetails!.lastName}'s`
            : `User #${this.user.id}'s`} Profile`)
    )
  }

}