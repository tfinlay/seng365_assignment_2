import React from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import {Box, Button, Card, Typography} from "@mui/material";
import {LoadStatusDone, LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {AuctionListPageContent} from "./AuctionListPageContent";
import {AuctionSupplierProvider, useAuctionSupplierStore} from "../auction_supplier_context";
import {useAuctionCategoriesStore} from "../../../store/auction_categories_store_context";
import {AuctionSkeleton} from "./AuctionSkeleton";

export const AuctionListPage: React.FC = observer(() => {
  const categories = useAuctionCategoriesStore()
  const store = useAuctionListStore()

  return (
    <Card sx={{width: '100%', boxSizing: 'border-box', padding: 2}}>
      {(categories.loadStatus instanceof LoadStatusError) ? (
        <Box sx={{padding: 1}}>
          <Typography variant="subtitle1" color="error">Failed to load category information:</Typography>
          <Typography variant="body1" color="error"><ErrorPresenter error={categories.loadStatus.error}/></Typography>
          <Button onClick={() => categories.fetchCategories()}>Try again</Button>
        </Box>
      ) : undefined}

      <AuctionSupplierProvider store={store.page}>
        <AuctionListPageRoot/>
      </AuctionSupplierProvider>
    </Card>
  )
})

const AuctionListPageRoot: React.FC = observer(() => {
  const page = useAuctionSupplierStore()

  if (page.isLoading) {
    return <AuctionListPageSkeleton/>
  }
  else if (page.loadStatus instanceof LoadStatusDone) {
    return <AuctionListPageContent/>
  }
  else if (page.loadStatus instanceof LoadStatusError) {
    return <ErrorPresenter error={page.loadStatus.error}/>
  }
  else {
    return <Typography variant='body1'>We've found ourselves in an unexpected state... Please reload the page to try again.</Typography>
  }
})

const AuctionListPageSkeleton: React.FC = () => {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
      <AuctionSkeleton/>
      <AuctionSkeleton opacity={0.65}/>
      <AuctionSkeleton opacity={0.3}/>
    </Box>
  )
}

