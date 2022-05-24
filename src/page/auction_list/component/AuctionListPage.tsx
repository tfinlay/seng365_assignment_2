import React from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import {Box, Button, Card, Skeleton, Typography} from "@mui/material";
import {LoadStatusDone, LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {AuctionListPageContent} from "./AuctionListPageContent";

export const AuctionListPage: React.FC = observer(() => {
  const store = useAuctionListStore()

  return (
    <Card sx={{width: '100%', boxSizing: 'border-box', padding: 2}}>
      {(store.categories.loadStatus instanceof LoadStatusError) ? (
        <Box sx={{padding: 1}}>
          <Typography variant="subtitle1" color="error">Failed to load category information:</Typography>
          <Typography variant="body1" color="error"><ErrorPresenter error={store.categories.loadStatus.error}/></Typography>
          <Button onClick={() => store.categories.fetchCategories()}>Try again</Button>
        </Box>
      ) : undefined}
      <AuctionListPageRoot/>
    </Card>
  )
})

const AuctionListPageRoot: React.FC = observer(() => {
  const store = useAuctionListStore()

  if (store.page.isLoading) {
    return <AuctionListPageSkeleton/>
  }
  else if (store.page.loadStatus instanceof LoadStatusDone) {
    return <AuctionListPageContent/>
  }
  else if (store.page.loadStatus instanceof LoadStatusError) {
    return <ErrorPresenter error={store.page.loadStatus.error}/>
  }
  else {
    return <Typography variant='body1'>We've found ourselves in an unexpected state... Would you like to: <Button onClick={() => store.reloadPage()}>Reload</Button>?</Typography>
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

interface AuctionSkeletonProps {
  opacity?: number,
}
const AuctionSkeleton: React.FC<AuctionSkeletonProps> = ({opacity}) => {
  return (
    <Box sx={{opacity: opacity}}>
      <Skeleton variant="rectangular" height={300} width={250} sx={{borderRadius: 2}}/>
    </Box>
  )
}