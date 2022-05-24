import React from "react";
import {Box, Card, CardHeader, Grid, LinearProgress, Typography} from "@mui/material";
import {observer, useLocalObservable} from "mobx-react-lite";
import {AuctionListStore} from "./AuctionListStore";
import {AuctionListStoreProvider, useAuctionListStore} from "./auction_list_store_context";
import {AuctionListPage} from "./component/AuctionListPage";


export const AuctionListPageRoot: React.FC = observer(() => {
  const store = useLocalObservable(() => new AuctionListStore())

  return (
    <AuctionListStoreProvider store={store}>
      <AuctionListContent/>
    </AuctionListStoreProvider>
  )
})

const AuctionListContent = observer(() => {
  const store = useAuctionListStore()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      {store.isLoading && <LinearProgress sx={{width: '100%'}} color='secondary'/>}

      <Box  sx={{width: '100%', maxWidth: 'xl', marginTop: 3, marginBottom: 3}}>
        <Typography variant='h3' sx={{marginBottom: 1}}>Browse Auctions</Typography>

        <Grid
          container
          spacing={1}
        >
          <Grid item xs={12} lg={3}>
            <Card sx={{width: '100%'}}>
              <CardHeader title="Filters" />
            </Card>
          </Grid>

          <Grid item xs={12} lg={9}>
            <AuctionListPage/>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})