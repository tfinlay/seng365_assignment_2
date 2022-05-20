import React from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {ApplicationStore} from "../../store/ApplicationStore";
import {Box, Card, Grid, Typography} from "@mui/material";
import {CentredForm} from "../../component/CentredForm";
import {FormCard} from "../../component/FormCard";
import {ProfileStore} from "./ProfileStore";
import {ProfileStoreProvider} from "./profile_store_context";
import {ProfilePictureEditor} from "./component/ProfilePictureEditor";

export const ProfilePage: React.FC = observer(() => {
  const store = useLocalObservable(() => new ProfileStore())

  return (
    <CentredForm>
      <FormCard
        title="My Profile"
        loading={false}
        onSubmit={() => null}
        cardStyles={{
          maxWidth: "lg"
        }}
        cardContentStyles={{
          flexDirection: "row"
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <ProfilePictureEditor/>
          </Grid>

          <Grid item xs={12} sm={8}>
            <p>Details</p>
          </Grid>
        </Grid>
      </FormCard>
    </CentredForm>
  )
})