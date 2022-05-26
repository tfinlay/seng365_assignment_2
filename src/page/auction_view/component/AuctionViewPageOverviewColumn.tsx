import React from "react";
import {observer} from "mobx-react-lite";
import {Box, Button, Chip, Link, Skeleton, Stack, Tooltip, Typography} from "@mui/material";
import {useAuctionViewStore} from "../auction_view_store_context";
import {Link as RouterLink, Navigate} from "react-router-dom";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {UserInfoRow} from "../../../component/UserInfoRow";
import {LocalOffer} from "@mui/icons-material";
import {useAuctionCategoriesStore} from "../../../store/auction_categories_store_context";
import {PlaceBidButton} from "../../auction_list/component/place_bid_popup/PlaceBidButton";
import {ApplicationStore} from "../../../store/ApplicationStore";

export const AuctionViewPageOverviewColumn: React.FC = observer(() => {
  const details = useAuctionViewStore().auction.details

  if (details.auction !== null) {
    return <AuctionViewPageOverviewColumnContent/>
  }
  else if (details.isLoading) {
    return <AuctionViewPageOverviewColumnSkeleton/>
  }
  else if (details.auctionDoesNotExist) {
    return <Navigate to="/404" replace/>
  }
  else {
    return (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load auction information:</Typography>
        <Typography variant="body1" color="error">
          {(details.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={details.loadStatus.error}/>
          ) : "Loading hasn't started yet"}
        </Typography>
        <Button onClick={() => details.fetchDetails()}>Try again</Button>
      </Box>
    )
  }
})

const AuctionViewPageOverviewColumnSkeleton: React.FC = () => {
  return (
    <Stack spacing={1}>
      <Typography variant='h4'><Skeleton/></Typography>
      <Skeleton variant='rectangular' width={250} sx={{borderRadius: 30}} height={30}/>
      <Stack direction='row' spacing={1}>
        <Skeleton variant='circular' height={48} width={48} sx={{flex: 0, flexBasis: 48}}/>
        <Skeleton sx={{flex: 1}}/>
      </Stack>
      <PlaceBidButton/>
    </Stack>
  )
}

const AuctionViewPageOverviewColumnContent: React.FC = observer(() => {
  const details = useAuctionViewStore().auction.details
  const auction = details.auction!

  return (
    <Stack gap={1} sx={{height: '100%'}}>
      <Typography variant='h4'>{auction!.title}</Typography>

      <Box>
        <Chip
          color="primary"
          variant="filled"
          label={`Closes: ${details.endDate!.toLocaleString()}`}
        />
      </Box>

      <AuctionViewPageOverviewColumnItemCategory/>

      <Link component={RouterLink} to={`/profile/${auction.sellerId}`} underline='hover'>
        <UserInfoRow userId={auction.sellerId} size={48}/>
      </Link>

      <Box>
        <Typography variant='h6' component='span' sx={{paddingRight: 1}}>Reserve</Typography>
        <Typography variant='h5' component='span'>${auction.reserve}.00</Typography>
      </Box>

      <PlaceBidButton/>
    </Stack>
  )
})

const AuctionViewPageOverviewColumnItemCategory: React.FC = observer(() => {
  const store = useAuctionViewStore()
  const categories = useAuctionCategoriesStore()

  if (categories.isLoading) {
    return (
      <Tooltip title='Loading Category'>
        <Typography variant='body1'><Skeleton/></Typography>
      </Tooltip>
    )
  }
  else {
    const categoryName = categories.categoriesById?.get(store.auction.details.auction!.categoryId)

    if (categoryName !== undefined) {
      return (
        <Typography variant='body1'><LocalOffer fontSize='inherit' sx={{verticalAlign: 'middle'}}/> {categoryName}</Typography>
      )
    }
    else {
      return (
        <Tooltip title={`Category ID is: ${store.auction.details.auction!.categoryId}`}>
          <Typography variant='body1' color='red' sx={{fontStyle: 'italic'}} onClick={() => categories.fetchCategories()}>
            Failed to find category. Click to reload.
          </Typography>
        </Tooltip>
      )
    }
  }
})

