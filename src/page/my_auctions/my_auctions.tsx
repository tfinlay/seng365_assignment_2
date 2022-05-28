import React from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {Box, Card, CardContent, CardHeader, Typography} from "@mui/material";
import {AuctionSkeleton} from "../auction_list/component/AuctionSkeleton";
import {AuctionListItem} from "../auction_list/component/AuctionListItem";
import {LoadStatusError} from "../../util/LoadStatus";
import {ErrorPresenter} from "../../component/ErrorPresenter";
import {AuctionSupplierProvider} from "../auction_list/auction_supplier_context";
import {MyAuctionsStore} from "./MyAuctionsStore";
import {AuctionCategoriesStore} from "../../store/AuctionCategoriesStore";
import {AuctionCategoriesStoreProvider} from "../../store/auction_categories_store_context";
import {AuctionPaginationControl} from "../../component/auction/pagination/AuctionPaginationControl";

export const MyAuctionsPage: React.FC = observer(() => {
  const store = useLocalObservable(() => new MyAuctionsStore())
  const categories = useLocalObservable(() => new AuctionCategoriesStore())
  
  let content
  if (store.isLoading) {
    content = <AuctionsSkeleton/>
  }
  else if (store.auctions !== null) {
    if (store.auctions.length > 0) {
      content = (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
          {store.auctions.map((auction, index) => (
            <AuctionListItem key={`${auction.auction.auctionId}`} index={index}/>
          ))}
        </Box>
      )
    }
    else {
      content = (
        <Typography variant="body1">No similar auctions found</Typography>
      )
    }

  }
  else if (store.loadStatus instanceof LoadStatusError) {
    content = <ErrorPresenter error={store.loadStatus.error}/>
  }
  else {
    content = <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }


  return (
    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', paddingTop: 2}}>
      <Card sx={{minWidth: 'sm', maxWidth: "lg", width: '100%'}}>
        <CardHeader title="My Auctions" subheader="Auctions that you've created or bid on." />

        <CardContent>
          <AuctionCategoriesStoreProvider store={categories}>
            <AuctionSupplierProvider store={store}>
              <Box>
                <AuctionPaginationControl store={store}/>
              </Box>

              <Box>
                {content}
              </Box>
            </AuctionSupplierProvider>
          </AuctionCategoriesStoreProvider>
        </CardContent>
      </Card>
    </Box>
  )
})

const AuctionsSkeleton: React.FC = () => {
  return (
    <Box>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        <AuctionSkeleton/>
        <AuctionSkeleton opacity={0.65}/>
        <AuctionSkeleton opacity={0.3}/>
      </Box>
    </Box>
  )
}