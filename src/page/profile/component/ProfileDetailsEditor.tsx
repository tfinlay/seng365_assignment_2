import React, {useCallback, useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {useProfileStore} from "../profile_store_context";
import {Button, CircularProgress, Grid, Skeleton, TextField, Typography} from "@mui/material";
import {ObservableFormValue} from "../../../util/ObservableFormValue";
import {emailFieldValidator, notEmptyFieldValidator} from "../../../util/validation";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../util/LoadStatus";
import {computed, makeObservable, observable, runInAction} from "mobx";
import {makeApiPath} from "../../../util/network_util";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {handleServerError} from "../../../util/error_util";
import {Check} from "@mui/icons-material";
import {ErrorPresenter} from "../../../component/ErrorPresenter";

type ProfileDetailsPatchBody = {firstName?: string, lastName?: string, email?: string}

class ProfileDetailsEditorStore {
  readonly userId: number

  readonly firstName: ObservableFormValue
  readonly lastName: ObservableFormValue
  readonly email: ObservableFormValue

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(userId: number, firstName: string, lastName: string, email: string) {
    makeObservable(this, {
      saveStatus: observable,

      isEdited: computed,
      isLoading: computed
    })

    this.userId = userId

    this.firstName = new ObservableFormValue<string>(firstName, notEmptyFieldValidator)
    this.lastName = new ObservableFormValue<string>(lastName, notEmptyFieldValidator)
    this.email = new ObservableFormValue<string>(email, emailFieldValidator)
  }

  get isEdited(): boolean {
    return this.firstName.valueEdited || this.lastName.valueEdited || this.email.valueEdited
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
  }

  protected buildPatchBody(): ProfileDetailsPatchBody | null {
    let body: ProfileDetailsPatchBody = {}
    if (this.firstName.valueEdited) {
      if (this.firstName.validate()) {
        body.firstName = this.firstName.value
      }
      else {
        return null
      }
    }

    if (this.lastName.valueEdited) {
      if (this.lastName.validate()) {
        body.lastName = this.lastName.value
      }
      else {
        return null
      }
    }

    if (this.email.valueEdited) {
      if (this.email.validate()) {
        body.email = this.email.value
      }
      else {
        return null
      }
    }

    return body
  }

  async saveChanges(): Promise<boolean> {
    if (!this.isEdited || this.isLoading) {
      return false
    }

    this.saveStatus = new LoadStatusPending()

    try {
      const body = this.buildPatchBody()

      this.firstName.resetEditedState()
      this.lastName.resetEditedState()
      this.email.resetEditedState()

      const res = await fetch(makeApiPath(`/users/${this.userId}`), {
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

export const ProfileDetailsEditor: React.FC = observer(() => {
  const pageStore = useProfileStore()
  const user = pageStore.user

  useEffect(() => {
    // FIXME: Can be a bit more clever to prevent re-fetching data we already have.
    user.profileDetails.fetchDetails()
  }, [user])

  if (user.profileDetails.hasDetails) {
    return <ProfileDetailsEditorContent/>
  }
  else if (user.profileDetails.isLoading) {
    return <ProfileDetailsEditorSkeleton/>
  }
  else if (user.profileDetails.loadStatus instanceof LoadStatusError) {
    return <ErrorPresenter error={user.profileDetails.loadStatus.error}/>
  }
  else {
    // No details and not loading... This user may not exist (or loading hasn't started yet)
    return (
      <Typography variant='subtitle1'>Failed to load user details. Please try again later.</Typography>
    )
  }
})

const ProfileDetailsEditorSkeleton: React.FC = () => {
  return (
    <Grid container columns={12} sx={{maxWidth: 500}} gap={1}>
      <Grid item xs={12} md={5}>
        <Skeleton>
          <TextField disabled/>
        </Skeleton>
      </Grid>

      <Grid item xs={12} md={5}>
        <Skeleton>
          <TextField disabled/>
        </Skeleton>
      </Grid>

      <Grid item xs={12} md={12}>
        <Skeleton>
          <TextField disabled/>
        </Skeleton>
      </Grid>
    </Grid>
  )
}

const ProfileDetailsEditorContent: React.FC = observer(() => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false)
  const pageStore = useProfileStore()
  const userDetails = pageStore.user.profileDetails!

  const [store, setStore] = useState(() => new ProfileDetailsEditorStore(
    pageStore.user.id,
    userDetails.firstName!,
    userDetails.lastName!,
    userDetails.email!
  ))

  useEffect(() => {
    setStore(new ProfileDetailsEditorStore(
      pageStore.user.id,
      userDetails.firstName!,
      userDetails.lastName!,
      userDetails.email!
    ))
  }, [setStore, pageStore.user.id, userDetails.firstName, userDetails.lastName, userDetails.email])

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    const success = await store.saveChanges()
    if (success) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 750)
    }
  }, [userDetails, store, setShowSuccess])

  const onFirstNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.firstName.setValue(evt.target.value)
  }, [store])

  const onLastNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.lastName.setValue(evt.target.value)
  }, [store])

  const onEmailChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.email.setValue(evt.target.value)
  }, [store])

  return (
    <form onSubmit={onSubmit}>
      <Grid container columns={12} sx={{maxWidth: 500}} gap={2}>
        <Grid item xs={12} md={5}>
          <TextField
            id="register-first-name"
            label='First Name'
            variant='outlined'
            sx={{flex: 1}}
            required
            disabled={store.isLoading}

            value={store.firstName.value}
            onChange={onFirstNameChange}
            error={store.firstName.hasError}
            helperText={store.firstName.error}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <TextField
            id="register-last-name"
            label='Last Name'
            variant='outlined'
            sx={{flex: 1}}
            required
            disabled={store.isLoading}

            value={store.lastName.value}
            onChange={onLastNameChange}
            error={store.lastName.hasError}
            helperText={store.lastName.error}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <TextField
            id="register-email"
            label='Email'
            variant='outlined'
            type="email"
            required
            disabled={store.isLoading}

            value={store.email.value}
            onChange={onEmailChange}
            error={store.email.hasError}
            helperText={store.email.error}
          />
        </Grid>

        <Grid item xs={12} md={5} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          {(showSuccess) ? (
            <Button type="button" variant="contained" color='success' sx={{width: '100%'}}><Check/>Saved</Button>
          ) : (
            (store.isLoading) ? (
              <CircularProgress/>
            ) : (
              <Button type="submit" variant='contained' disabled={store.isLoading || !store.isEdited}>Save Changes</Button>
            )
          )}
        </Grid>

        {(store.saveStatus instanceof LoadStatusError) ? (
          <Grid xs={12}>
            <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveStatus.error}/></Typography>
          </Grid>
        ) : undefined}

      </Grid>
    </form>
  )
})