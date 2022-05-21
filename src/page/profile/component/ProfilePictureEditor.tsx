import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {observer} from "mobx-react-lite";
import {Box, Button, IconButton, Skeleton, Tooltip, Typography} from "@mui/material";
import {
  RemoveCircle,
  Upload
} from "@mui/icons-material";
import {ProfilePhotoBlobView} from "../../../component/ProfilePhotoBlobView";
import {LoadStatusDone, LoadStatusError, LoadStatusPending} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {useProfileStore} from "../profile_store_context";
import {CurrentUserStore} from "../../../store/UserStore";

export const ProfilePictureEditor: React.FC = observer(() => {
  const store = useProfileStore()
  const user = store.user

  useEffect(() => {
    // FIXME: Can be a bit more clever to prevent re-fetching data we already have.
    user.profilePhoto.fetchImage()
  }, [user])

  if (user.updateProfilePhotoStatus instanceof LoadStatusPending || user.profilePhoto.isLoading) {
    return <ProfilePictureEditorSkeleton/>
  }
  else if (user.profilePhoto.loadStatus instanceof LoadStatusDone) {
    return <ProfilePictureEditorContent/>
  }
  else if (user.profilePhoto.loadStatus instanceof LoadStatusError) {
    return <ErrorPresenter error={user.profilePhoto.loadStatus.error}/>
  }
  else {
    // No data and not loading... This user may not exist (or loading hasn't started yet)
    return (
      <Typography variant='subtitle1'>Failed to load profile picture. Please try again later.</Typography>
    )
  }
})

const ProfilePictureEditorSkeleton: React.FC = observer(() => {
  const store = useProfileStore()
  const user = store.user

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          width: '65%',
          height: 'auto',
          aspectRatio: 1,
          position: 'relative'
        }}
      >
        <Skeleton variant='circular' width='100%' height='auto' sx={{aspectRatio: '1 / 1', display: 'block'}}/>
        {/*<Skeleton variant='circular' width={50} height={50} sx={{position: 'absolute', top: 5, right: -5}} />*/}
      </Box>

      {user.isEditable && (
        <Skeleton>
          <Button component='span' disabled><Upload/> Upload Profile Photo</Button>
        </Skeleton>
      )}
    </Box>
  )
})

const ProfilePictureEditorContent: React.FC = observer(() => {
  const store = useProfileStore()
  const user = store.user

  const [photoSize, setPhotoSize] = useState<number>(0)
  const [lastUploadError, setLastUploadError] = useState<string | null>(null)

  const photo = user.profilePhoto
  const uploadStatus = user.updateProfilePhotoStatus

  const pictureContainerRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const el = pictureContainerRef.current
    if (el !== null) {
      const updatePhotoSize = () => {
        setPhotoSize(Math.min(
          Math.max(
            el.getBoundingClientRect().width * 0.65,
            190
          ),
          270
        ))
      }

      updatePhotoSize()

      const observer = new ResizeObserver(updatePhotoSize)
      observer.observe(el)

      return () => {
        observer.disconnect()
      }
    }
  }, [pictureContainerRef, setPhotoSize])

  const onDelete = useCallback(() => {
    (user as CurrentUserStore).deleteProfilePhoto()
  }, [user])

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files?.length === 1) {
      setLastUploadError(null);
      (user as CurrentUserStore).uploadProfilePhoto(evt.target.files[0])
    } else {
      setLastUploadError("Please choose one file to upload.")
    }
  }, [user])


  let currentUploadError = null
  if (lastUploadError !== null) {
    currentUploadError = lastUploadError
  } else if (uploadStatus instanceof LoadStatusError) {
    currentUploadError = uploadStatus.error
  }

  return (
    <>
      {(user.isEditable) && (
        <input
          hidden

          onChange={onFileChange}

          type="file"
          accept="image/jpeg,image/gif,image/png"
          id="profile-upload-image"
        />
      )}

      <div
        ref={pictureContainerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'center'
        }}
      >
        <Box
          style={{
            width: photoSize,
            height: 'auto',
            aspectRatio: "1 / 1",
            position: 'relative'
          }}
        >
          <ProfilePhotoBlobView image={photo.imageData} size={photoSize} color="disabled"/>
          {(photo.hasImage && user.isEditable) ? (
            <Tooltip title="Remove custom profile picture">
              <IconButton
                onClick={onDelete}
                color="error"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0
                }}
              >
                <RemoveCircle sx={{fontSize: photoSize / 6}}/>
              </IconButton>
            </Tooltip>
          ) : undefined}
        </Box>

        {(currentUploadError !== null) ? (
          <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter
            error={currentUploadError}/></Typography>
        ) : undefined}

        {(user.isEditable) && (
          <label htmlFor="profile-upload-image">
            <Button component='span'><Upload/> Upload Profile Photo</Button>
          </label>
        )}
      </div>
    </>
  )
})