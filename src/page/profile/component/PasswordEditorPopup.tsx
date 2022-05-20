import React, {useCallback, useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {ObservableFormValue} from "../../../util/ObservableFormValue";
import {notEmptyFieldValidator, passwordFieldValidator} from "../../../util/validation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Typography
} from "@mui/material";
import {PasswordField} from "../../../component/PasswordField";
import {action, computed, makeObservable, observable, runInAction} from "mobx";
import {
  LoadStatus,
  LoadStatusDone,
  LoadStatusError,
  LoadStatusNotYetAttempted,
  LoadStatusPending
} from "../../../util/LoadStatus";
import {makeApiPath} from "../../../util/network_util";
import {ServerError} from "../../../util/ServerError";
import {useProfileStore} from "../profile_store_context";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {ApplicationStore} from "../../../store/ApplicationStore";
import {Check} from "@mui/icons-material";
import {handleServerError} from "../../../util/error_util";

class PasswordEditorPopupStore {
  readonly userId: number

  readonly currentPassword = new ObservableFormValue<string>("", notEmptyFieldValidator)
  readonly newPassword = new ObservableFormValue<string>("", passwordFieldValidator)

  saveStatus: LoadStatus = new LoadStatusNotYetAttempted()

  constructor(userId: number) {
    makeObservable(this, {
      saveStatus: observable,

      isLoading: computed,
      isDone: computed,

      validateAndSubmit: action
    })

    this.userId = userId
  }

  get isLoading(): boolean {
    return this.saveStatus instanceof LoadStatusPending
  }

  get isDone(): boolean {
    return this.saveStatus instanceof LoadStatusDone
  }

  protected async submit(): Promise<void> {
    if (this.saveStatus instanceof LoadStatusPending) {
      return
    }

    this.saveStatus = new LoadStatusPending()

    try {
      const res = await fetch(makeApiPath(`/users/${this.userId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': ApplicationStore.main.user!.token
        },
        body: JSON.stringify({
          currentPassword: this.currentPassword.value,
          password: this.newPassword.value
        })
      })

      if (!res.ok) {
        handleServerError(res)
        return
      }

      runInAction(() => {
        this.saveStatus = new LoadStatusDone()
      })
    }
    catch (e) {
      runInAction(() => {
        this.saveStatus = new LoadStatusError(e)
      })
      throw e
    }
  }

  async validateAndSubmit(): Promise<boolean> {
    if (this.currentPassword.validate() && this.newPassword.validate()) {
      try {
        await this.submit()
      }
      catch (e) {
        throw e
      }
      return true
    }
    else {
      return false
    }
  }

}

interface PasswordEditorPopupProps {
  open: boolean
  onClose: VoidFunction
}
export const PasswordEditorPopup: React.FC<PasswordEditorPopupProps> = observer(({ open, onClose }) => {
  const pageStore = useProfileStore()
  const userId = pageStore.user.id

  const [store, setStore] = useState(new PasswordEditorPopupStore(userId))

  useEffect(() => {
    if (userId !== store.userId) {
      setStore(new PasswordEditorPopupStore(userId))
    }
  }, [store.userId, userId])

  const onSubmit = useCallback(async () => {
    const success = await store.validateAndSubmit()
    if (success) {
      setTimeout(() => onClose(), 750)
    }
  }, [onClose, store])

  const onFormSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()
    await onSubmit()
  }, [onSubmit])

  return (
    <Dialog open={open} onClose={onClose}>
      {store.isLoading && <LinearProgress/>}

      <form onSubmit={onFormSubmit}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
            <Stack gap={1} sx={{marginTop: 1}}>
              <PasswordField passwordStore={store.currentPassword} loading={store.isLoading} labelText='Current Password' autoFocus/>
              <PasswordField passwordStore={store.newPassword} loading={store.isLoading} labelText='New Password'/>

              {(store.saveStatus instanceof LoadStatusError) ? (
                <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveStatus.error}/></Typography>
              ) : undefined}
            </Stack>
        </DialogContent>
        <DialogActions sx={{display: 'flex', justifyContent: 'space-between'}}>
          {(store.isDone) ? (
            <Button type="button" variant="contained" color='success' sx={{width: '100%'}} onClick={onClose}><Check/>Saved</Button>
          ) : (
          <>
            <Button type="button" variant="outlined" disabled={store.isLoading || store.isDone} onClick={onClose} tabIndex={4}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={store.isLoading} onClick={onSubmit}>Submit</Button>
          </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
})