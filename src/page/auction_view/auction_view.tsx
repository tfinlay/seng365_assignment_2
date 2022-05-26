import React, {useEffect, useReducer, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {AuctionStore} from "../../store/AuctionStore";
import {observable} from "mobx";
import {AuctionViewStore} from "./AuctionViewStore";
import {Centred} from "../../component/Centred";
import {AuctionViewStoreProvider, useAuctionViewStore} from "./auction_view_store_context";
import {Box, Card, CardContent, CardHeader, Chip, Grid, Skeleton, Stack, Tooltip, Typography} from "@mui/material";
import {LoadStatusDone, LoadStatusError} from "../../util/LoadStatus";
import {ErrorPresenter} from "../../component/ErrorPresenter";
import {Navigate} from "react-router-dom";
import {PhotoBlobView} from "../../component/PhotoBlobView";
import {AuctionViewPageOverviewColumn} from "./component/AuctionViewPageOverviewColumn";
import {AuctionViewPageBidColumn} from "./component/AuctionViewPageBidColumn";
import {AuctionViewPageSimilarAuctionsRow} from "./component/AuctionViewPageSimilarAuctionsRow";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {AuctionCategoriesStoreProvider} from "../../store/auction_categories_store_context";

const makeStore = (auction: AuctionStore) => observable(new AuctionViewStore(auction), {}, {autoBind: true})

interface AuctionViewPageProps {
  auction: AuctionStore
}
export const AuctionViewPage: React.FC<AuctionViewPageProps> = observer(({auction}) => {
  const [store, setStore] = useState(() => makeStore(auction))
  const categories = useLocalObservable(() => new AuctionCategoriesStore())

  useEffect(() => {
    if (store.auction !== auction) {
      setStore(makeStore(auction))
    }
  }, [store, auction])

  return (
    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: 3}}>
      <AuctionCategoriesStoreProvider store={categories}>
        <AuctionViewStoreProvider store={store}>
          <Card sx={{minWidth: 'sm', maxWidth: "lg", width: '100%'}}>
            <CardContent sx={{
              flexDirection: "row"
            }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <PhotoBlobView
                    image={store.auction.photo.imageData}
                    imageBuilder={(src) => (
                      <img
                        src={src}
                        style={{
                          width: '100%',
                          maxHeight: 400
                        }}
                        alt='Auction item'
                      />
                    )}
                    defaultBuilder={() => (
                      <Skeleton variant='rectangular' height={400}/>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <AuctionViewPageOverviewColumn/>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <AuctionViewPageBidColumn/>
                </Grid>

                <Grid item xs={12}>
                  <AuctionViewPageDescription/>
                </Grid>

                <Grid item xs={12}>
                  <AuctionViewPageSimilarAuctionsRow/>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AuctionViewStoreProvider>
      </AuctionCategoriesStoreProvider>
    </Box>
  )
})


const AuctionViewPageDescription = observer(() => {
  const store = useAuctionViewStore()

  if (store.auction.details.isLoading) {
    return (
      <Typography variant='body1'><Skeleton/></Typography>
    )
  }
  else {
    return <Typography variant='body1' sx={{whiteSpace: 'pre-line'}}>{store.auction.details.auction?.description ?? "No description"}</Typography>
  }
})