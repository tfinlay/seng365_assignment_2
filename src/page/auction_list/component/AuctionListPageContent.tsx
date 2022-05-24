import React from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import { Box } from "@mui/material";
import {AuctionListItem} from "./AuctionListItem";

export const AuctionListPageContent: React.FC = observer(() => {
  const store = useAuctionListStore()

  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
      {store.page.auctions!.map((auction, index) => (
        <AuctionListItem key={`${auction.auction.auctionId}`} index={index}/>
      ))}
    </Box>
  )
})

