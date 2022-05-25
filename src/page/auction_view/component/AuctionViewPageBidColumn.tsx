import React from "react";
import {observer} from "mobx-react-lite";
import {useAuctionViewStore} from "../auction_view_store_context";
import {
  Box,
  Button,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../../component/ErrorPresenter";
import {AuctionViewBidsStoreBid} from "../AuctionViewBidsStore";
import {EmojiEvents, Refresh} from "@mui/icons-material";
import {useProfilePhotoBlob} from "../../../hook/useProfilePhotoBlob";
import {ProfilePhotoBlobView} from "../../../component/ProfilePhotoBlobView";

export const AuctionViewPageBidColumn: React.FC = observer(() => {
  const store = useAuctionViewStore()

  let content
  if (store.bids.isLoading) {
    content = (
      <Box>
        <Skeleton width='100%'/>
        <Skeleton width='95%'/>
        <Skeleton width='90%'/>
      </Box>
    )
  } else if (store.bids.bids !== null) {
    content = <AuctionViewPageBidColumnContent/>
  } else {
    // ERROR
    content = (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load bid information:</Typography>
        <Typography variant="body1" color="error">
          {(store.bids.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={store.bids.loadStatus.error}/>
          ) : "Loading hasn't started yet"}
        </Typography>
        <Button onClick={() => store.bids.fetchBids()}>Try again</Button>
      </Box>
    )
  }

  return (
    <Box sx={{flex: 1, maxHeight: 400, display: 'flex', flexDirection: 'column'}}>
      <Typography variant='h6'>Bid History</Typography>
      {content}
    </Box>
  )
})

const AuctionViewPageBidColumnContent: React.FC = observer(() => {
  const store = useAuctionViewStore()
  const bids = store.bids.bids!

  if (bids.length === 0) {
    return (
      <Stack sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center'}}>
        <Typography variant="body1">No bids yet!</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={() => store.bids.fetchBids()} color='primary' size='small'>
            <Refresh/>
          </IconButton>
        </Tooltip>
      </Stack>
    )
  }

  return (
    <>
      <Typography variant='overline' sx={{lineHeight: 1}}>{bids.length} bids</Typography>

      <table>
        <tbody>
        {bids.map((bid, index) => (
          <AuctionViewPageOverviewColumnBidsBid key={`bid-${bid.amount}`} bid={bid} isLeader={index == 0}/>
        ))}
        </tbody>
      </table>
    </>
  )
})

interface AuctionViewPageOverviewColumnBidsBidProps {
  bid: AuctionViewBidsStoreBid
  isLeader: boolean
}
const AuctionViewPageOverviewColumnBidsBid: React.FC<AuctionViewPageOverviewColumnBidsBidProps> = observer(({bid, isLeader}) => {
  const photoBlob = useProfilePhotoBlob(bid.bidderId)

  return (
    <tr>
      <td style={{verticalAlign: 'middle'}}>
        <Tooltip title={<ProfilePhotoBlobView image={photoBlob.imageData} size={128} style={{verticalAlign: 'middle'}}/>}>
          <IconButton
            component={RouterLink}
            to={`/profile/${bid.bidderId}`}
            size='small'
            color='primary'
          >
            <ProfilePhotoBlobView image={photoBlob.imageData} size={32} style={{verticalAlign: 'middle'}}/>
          </IconButton>
        </Tooltip>
      </td>

      <td>
        <Box>
          <Typography variant='overline' sx={{lineHeight: 1}}>{bid.timestamp.toLocaleString()}</Typography>
        </Box>

        <Box>
          <Link component={RouterLink} to={`/profile/${bid.bidderId}`} underline='hover'>
            {bid.firstName} {bid.lastName}
            {(isLeader) && (
              <Tooltip title='Leading bid'>
                <EmojiEvents fontSize='inherit' color='warning'/>
              </Tooltip>
            )}
          </Link>
        </Box>
      </td>

      <td style={{fontWeight: (isLeader) ? 'bold' : 'normal'}}>
        ${bid.amount}.00
      </td>
    </tr>
  )
})