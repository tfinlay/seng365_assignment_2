import React from "react";
import {Box, Grid, LinearProgress, Typography} from "@mui/material";
import {observer, useLocalObservable} from "mobx-react-lite";
import {AuctionListStore} from "./AuctionListStore";
import {AuctionListStoreProvider, useAuctionListStore} from "./auction_list_store_context";
import {AuctionListPage} from "./component/AuctionListPage";
import {AuctionFilters} from "./component/AuctionFilters";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {AuctionCategoriesStoreProvider, useAuctionCategoriesStore} from "../../store/auction_categories_store_context";


export const AuctionListPageRoot: React.FC = observer(() => {
  const store = useLocalObservable(() => new AuctionListStore())
  const categories = useLocalObservable(() => new AuctionCategoriesStore())

  return (
    <AuctionCategoriesStoreProvider store={categories}>
      <AuctionListStoreProvider store={store}>
        <AuctionListContent/>
      </AuctionListStoreProvider>
    </AuctionCategoriesStoreProvider>
  )
})

const AuctionListContent = observer(() => {
  const store = useAuctionListStore()
  const categories = useAuctionCategoriesStore()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      {(store.isLoading || categories.isLoading) && <LinearProgress sx={{width: '100%'}} color='secondary'/>}

      <Box  sx={{width: '100%', maxWidth: 'xl', marginTop: 3, marginBottom: 3}}>
        <Typography variant='h3' sx={{marginBottom: 1}}>Browse Auctions</Typography>

        <Grid
          container
          spacing={1}
        >
          <Grid item xs={12} lg={3}>
            <AuctionFilters/>
          </Grid>

          <Grid item xs={12} lg={9}>
            <AuctionListPage/>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})