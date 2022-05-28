import React, {useCallback, useEffect, useState} from "react";
import {Centred} from "../../component/Centred";
import {
  Box,
  Button,
  Card,
  CardActions,
  IconButton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {observer, useLocalObservable} from "mobx-react-lite";
import {RegisterStore} from "./RegisterStore";
import {useNavigate} from "react-router-dom";
import {LoadStatusError} from "../../util/LoadStatus";
import {ErrorPresenter} from "../../component/ErrorPresenter";
import {AccountCircle, Cancel, Upload} from "@mui/icons-material";
import {ApplicationStore} from "../../store/ApplicationStore";
import {FormCard} from "../../component/FormCard";
import {PasswordField} from "../../component/PasswordField";

export const RegisterPage: React.FC = observer(() => {
  if (ApplicationStore.main.isLoggedIn) {
    return (
      <Centred>
        <Card sx={{minWidth: 'sm', maxWidth: 450, width: '100%'}}>
          <Typography variant="h6">You're already signed in!</Typography>
        </Card>
      </Centred>
    )
  }

  return (
    <RegisterPageContent/>
  )
})

const RegisterPageContent: React.FC = observer(() => {
  const store = useLocalObservable(() => new RegisterStore())
  const navigate = useNavigate()

  const onFirstNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.firstName.setValue(evt.target.value)
  }, [store])

  const onLastNameChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.lastName.setValue(evt.target.value)
  }, [store])

  const onEmailChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.email.setValue(evt.target.value)
  }, [store])

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()
    const res = await store.validateAndSubmit()
    if (res !== null) {
      navigate("/")
    }
  }, [navigate, store])

  return (
    <Centred>
      <FormCard
        title='Register'
        loading={store.isLoading}
        onSubmit={onSubmit}
        actions={(
          <CardActions sx={{display: 'flex', flexDirection: 'row-reverse'}}>
            <Button type="submit" variant="contained" disabled={store.isLoading}>Submit</Button>
          </CardActions>
        )}
      >
          <ProfileImageSelectorAndPreview store={store}/>

          <Box sx={{display: 'flex', gap: 1}}>
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
          </Box>

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

          <PasswordField passwordStore={store.password} loading={store.isLoading}/>

          {(store.saveStatus instanceof LoadStatusError) ? (
            <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveStatus.error}/></Typography>
          ) : undefined}
      </FormCard>
    </Centred>
  )
})

interface ProfileImageSelectorAndPreviewProps {
  store: RegisterStore
}
const ProfileImageSelectorAndPreview: React.FC<ProfileImageSelectorAndPreviewProps> = observer(({store}) => {
  const [lastUploadError, setLastUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const profilePhotoSize = 150

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files.length === 1) {
      store.setProfilePhoto(evt.target.files[0])
    }
    else {
      setLastUploadError("Please choose one file to upload.")
    }
  }, [store])

  const onDeleteClick = useCallback(() => {
    store.setProfilePhoto(null)
  }, [store])

  useEffect(() => {
    if (store.profilePhoto === null) {
      setImagePreview(null)
    }
    else {
      const url = URL.createObjectURL(store.profilePhoto)
      setImagePreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [store.profilePhoto])

  return (
    <>
      <input
        hidden

        disabled={store.isLoading}

        onChange={onFileChange}

        type="file"
        accept="image/jpeg,image/gif,image/png"
        id="register-upload-image"
      />

      <Box sx={{textAlign: 'center'}}>
        <Box>
          {(store.hasCustomProfilePhoto && imagePreview !== null) ? (
            <Box sx={{position: 'relative', display: 'inline-block'}}>
              <img
                src={imagePreview}
                style={{width: profilePhotoSize, height: profilePhotoSize, borderRadius: profilePhotoSize/2}}
                alt="Preview of custom profile"
              />

              <Tooltip title="Delete custom profile picture">
                <IconButton
                  disabled={store.isLoading}
                  onClick={onDeleteClick}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -10
                  }}
                >
                  <Cancel sx={{fontSize: 32}}/>
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <AccountCircle sx={{fontSize: profilePhotoSize}} color='disabled'/>
          )}
        </Box>

        {(lastUploadError !== null) ? (
          <Typography variant="body1" sx={{color: 'error.main'}}>{lastUploadError}</Typography>
        ) : undefined}

        <label htmlFor="register-upload-image">
          <Button component='span' disabled={store.isLoading}><Upload/> Upload Profile Photo</Button>
        </label>
      </Box>
    </>
  )
})