import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import {Box, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";
import {AuctionListItem} from "./AuctionListItem";
import {AuctionListFiltersSortBy} from "../AuctionListPageStore";
import {runInAction} from "mobx";
import {AuctionPaginationControl} from "../../../component/auction/pagination/AuctionPaginationControl";

export const AuctionListPageContent: React.FC = observer(() => {
  const store = useAuctionListStore()

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 2}}>
        <AuctionPaginationControl store={store}/>

        <AuctionListPageSortSelector/>
      </Box>

      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
        {store.page.auctions!.map((auction, index) => (
          <AuctionListItem key={`${auction.auction.auctionId}`} index={index}/>
        ))}
      </Box>
    </>
  )
})

const AuctionListPageSortSelector: React.FC = observer(() => {
  const store = useAuctionListStore()

  const onSortByChange = useCallback((evt: SelectChangeEvent) => {
    runInAction(() => {
      store.filters.setSortBy(evt.target.value as AuctionListFiltersSortBy)
      store.reloadPage()
    })
  }, [store])

  return (
    <FormControl>
      <InputLabel id='AuctionListPageSortSelector-label'>Sort By</InputLabel>
      <Select
        labelId='AuctionListPageSortSelector-label'
        id='AuctionListPageSortSelector-input'
        value={store.filters.sortBy}
        label='Sort By'
        onChange={onSortByChange}
      >
        <MenuItem value='ALPHABETICAL_ASC'>Alphabetical Ascending</MenuItem>
        <MenuItem value='ALPHABETICAL_DESC'>Alphabetical Descending</MenuItem>
        <MenuItem value='BIDS_ASC'>Bids Ascending</MenuItem>
        <MenuItem value='BIDS_DESC'>Bids Descending</MenuItem>
        <MenuItem value='CLOSING_SOON'>Closing Soon</MenuItem>
        <MenuItem value='CLOSING_LAST'>Closing Last</MenuItem>
        <MenuItem value='RESERVE_ASC'>Reserve Ascending</MenuItem>
        <MenuItem value='RESERVE_DESC'>Reserve Descending</MenuItem>
      </Select>
    </FormControl>
  )
})
