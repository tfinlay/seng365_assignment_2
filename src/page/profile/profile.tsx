import React, {useCallback, useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {ApplicationStore} from "../../store/ApplicationStore";
import {Box, Button, Card, CardContent, CardHeader, Grid, LinearProgress, Stack, Typography} from "@mui/material";
import {Centred} from "../../component/Centred";
import {FormCard} from "../../component/FormCard";
import {ProfileStore} from "./ProfileStore";
import {ProfileStoreProvider, useProfileStore} from "./profile_store_context";
import {ProfilePictureEditor} from "./component/ProfilePictureEditor";
import {UserStore} from "../../store/UserStore";
import {observable} from "mobx";
import {Navigate, useParams} from "react-router-dom";
import {ProfileDetailsEditor} from "./component/ProfileDetailsEditor";
import {PasswordEditorPopup} from "./component/PasswordEditorPopup";

export const OtherUserProfilePage: React.FC = () => {
  const params = useParams<{userId: string}>()
  const userId = parseInt(params.userId ?? "NaN", 10)

  const [user, setUser] = useState(() => new UserStore(userId))

  useEffect(() => {
    if (userId !== user.id) {
      setUser(new UserStore(userId))
    }
  }, [user.id, userId])

  if (isNaN(userId)) {
    return <Navigate to="/404" replace/>
  }

  return <ProfilePage user={user}/>
}

const makeStore = (user: UserStore) => observable(new ProfileStore(user), {}, {autoBind: true})

interface ProfilePageProps {
  user: UserStore
}
export const ProfilePage: React.FC<ProfilePageProps> = observer(({user}) => {
  const [store, setStore] = useState(() => makeStore(user))

  useEffect(() => {
    if (store.user !== user) {
      setStore(makeStore(user))
    }
  }, [store, user])


  return (
    <Centred>
      <ProfileStoreProvider store={store}>
        <Card sx={{minWidth: 'sm', maxWidth: (user.isEditable) ? "lg" : "sm", width: '100%'}}>
          <CardHeader title={(user.isEditable) ? <TitleWithActionButtons/> : store.pageTitle} />
          <CardContent sx={{
            flexDirection: "row"
          }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={(user.isEditable) ? 4 : 12}>
                <ProfilePictureEditor/>
              </Grid>

              {(user.isEditable) ? (
                <Grid item xs={12} sm={8}>
                  <ProfileDetailsEditor/>
                </Grid>
              ) : undefined}
            </Grid>
          </CardContent>
        </Card>
      </ProfileStoreProvider>
    </Centred>
  )
})

const TitleWithActionButtons: React.FC = observer(() => {
  const [showingPasswordPopup, setShowingPasswordPopup] = useState<boolean>(false)
  const store = useProfileStore()

  const onChangePasswordClick = useCallback(() => {
    setShowingPasswordPopup(true)
  }, [setShowingPasswordPopup])

  const onPasswordPopupClose = useCallback(() => {
    setShowingPasswordPopup(false)
  }, [setShowingPasswordPopup])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Box>{store.pageTitle}</Box>
        <Stack direction='row'>
          <Button variant="contained" onClick={onChangePasswordClick}>Change Password</Button>
        </Stack>
      </Box>

      {showingPasswordPopup && <PasswordEditorPopup open={showingPasswordPopup} onClose={onPasswordPopupClose}/>}
    </>
  )
})