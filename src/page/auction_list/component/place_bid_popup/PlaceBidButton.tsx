import React, {useCallback, useState} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionViewStore} from "../../../auction_view/auction_view_store_context";
import {Button, Skeleton, Tooltip} from "@mui/material";
import {PlaceBidEntryField} from "./PlaceBidEntryField";
import {ApplicationStore} from "../../../../store/ApplicationStore";
import {Link} from "react-router-dom";

export const PlaceBidButton: React.FC = observer(() => {
  const store = useAuctionViewStore()

  if (store.bids.isLoading || store.auction.details.isLoading) {
    return <Skeleton variant='rectangular' height={40} sx={{borderRadius: 1}}/>
  }
  else if (store.bids.bids !== null && store.auction.details.auction !== null) {
    return <PlaceBidButtonContent/>
  }
  else {
    return (
      <Tooltip title='This element requires both bids and auction details to be available, but they have failed to load.'>
        <Skeleton variant='rectangular' color='error'/>
      </Tooltip>
    )
  }
})

const PlaceBidButtonContent: React.FC = observer(() => {
  const [showBidEntry, setShowBidEntry] = useState<boolean>(false)
  const store = useAuctionViewStore()
  const details = store.auction.details

  const onToggleShowBidEntry = useCallback(() => {
    setShowBidEntry((prev) => !prev)
  }, [])

  if (details.endDate! < new Date()) {
    return (
      <Button variant='contained' disabled>Auction closed</Button>
    )
  }
  else if (!ApplicationStore.main.isLoggedIn) {
    return (
      <Button component={Link} to='/login' variant='contained' color='secondary'>Log in to Bid</Button>
    )
  }
  else if (details.auction!.sellerId === ApplicationStore.main.user!.id) {
    return (
      <Button variant='contained' disabled>This is your auction</Button>
    )
  }
  else if (!showBidEntry) {
    return (
      <Button variant='contained' color='secondary' onClick={onToggleShowBidEntry}>Place Bid</Button>
    )
  }
  else {
    // Show the bid entry field
    return <PlaceBidEntryField onClose={onToggleShowBidEntry}/>
  }
})

