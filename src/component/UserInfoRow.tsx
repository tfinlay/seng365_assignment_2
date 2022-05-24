import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {UserStore} from "../store/UserStore";
import {observable} from "mobx";
import {ProfileStore} from "../page/profile/ProfileStore";
import {Box, Skeleton, Typography} from "@mui/material";
import {ProfilePhotoBlobView} from "./ProfilePhotoBlobView";

const makeStore = (userId: number) => observable(new UserStore(userId), {}, {autoBind: true})

interface UserInfoRowProps {
  userId: number
}
export const UserInfoRow: React.FC<UserInfoRowProps> = observer(({userId}) => {
  const [store, setStore] = useState(() => makeStore(userId))

  useEffect(() => {
    if (store.id !== userId) {
      setStore(makeStore(userId))
    }
  }, [store, userId])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <ProfilePhotoBlobView image={store.profilePhoto.imageData} size={32}/>

      <Box sx={{flex: 1, paddingLeft: 1}}>
        <Typography variant="body1">{(store.profileDetails.hasDetails) ? <>{store.profileDetails.firstName} {store.profileDetails.lastName}</> : <Skeleton/>}</Typography> {/* TODO: Present errors here to the user. */}
      </Box>
    </Box>
  )
})