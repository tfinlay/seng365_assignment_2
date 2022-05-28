import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionViewStore} from "../auction_view_store_context";
import {AuctionViewSimilarStore} from "../AuctionViewSimilarStore";
import {AuctionDetails} from "../../../store/AuctionDetailsStore";
import {observable} from "mobx";
import {Box, Skeleton, Typography} from "@mui/material";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {AuctionSupplierProvider} from "../../auction_list/auction_supplier_context";
import {AuctionSkeleton} from "../../auction_list/component/AuctionSkeleton";
import {AuctionListItem} from "../../auction_list/component/AuctionListItem";

export const AuctionViewPageSimilarAuctionsRow: React.FC = observer(() => {
  const store = useAuctionViewStore()
  const details = store.auction.details

  if (details.auction !== null) {
    return <AuctionViewPageSimilarAuctionsRowContent/>
  }
  else if (details.isLoading) {
    return <AuctionViewPageSimilarAuctionsRowSkeleton/>
  }
  else {
    return <></>
  }
})

const AuctionViewPageSimilarAuctionsRowSkeleton: React.FC = () => {
  return (
    <Box>
      <Skeleton variant='rectangular'/>
      <Skeleton variant='rectangular'/>
      <Skeleton variant='rectangular'/>
    </Box>
  )
}

const makeStore = (auction: AuctionDetails) => observable(new AuctionViewSimilarStore(auction), {}, {autoBind: true})

const AuctionViewPageSimilarAuctionsRowContent: React.FC = observer(() => {
  const auction = useAuctionViewStore().auction.details.auction!
  const [similarStore, setSimilarStore] = useState<AuctionViewSimilarStore>(() => makeStore(auction))

  useEffect(() => {
    if (
      similarStore.auction.auctionId !== auction.auctionId
      || similarStore.auction.sellerId !== auction.sellerId
      || similarStore.auction.categoryId !== auction.categoryId
    ) {
      setSimilarStore(makeStore(auction))
    }
  }, [similarStore.auction.auctionId, auction.sellerId, auction.categoryId, auction])

  let content
  if (similarStore.isLoading) {
    content = <AuctionViewPageSimilarAuctionsRowContentSkeleton/>
  }
  else if (similarStore.auctions !== null) {
    if (similarStore.auctions.length > 0) {
      content = (
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
          {similarStore.auctions.map((auction, index) => (
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
  else if (similarStore.loadStatus instanceof LoadStatusError) {
    content = <ErrorPresenter error={similarStore.loadStatus.error}/>
  }
  else {
    content = <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }


  return (
    <AuctionSupplierProvider store={similarStore}>
      <Box>
        <Typography variant='h6'>Similar Auctions</Typography>
        {content}
      </Box>
    </AuctionSupplierProvider>
  )
})

const AuctionViewPageSimilarAuctionsRowContentSkeleton: React.FC = () => {
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