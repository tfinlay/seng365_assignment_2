import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {
  alpha,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Skeleton,
  Tooltip,
  Typography, useTheme
} from "@mui/material";
import {PhotoBlobView} from "../../../component/PhotoBlobView";
import {useAuctionListStore} from "../auction_list_store_context";
import {Link} from "react-router-dom";
import {AuctionListPageAuction} from "../AuctionListPageAuction";
import intervalToDuration from "date-fns/intervalToDuration";
import {LocalOffer, Tag} from "@mui/icons-material";
import {UserInfoRow} from "../../../component/UserInfoRow";

interface AuctionListItemProps {
  index: number
}
export const AuctionListItem: React.FC<AuctionListItemProps> = observer(({index}) => {
  const store = useAuctionListStore()
  const auction = store.page.auctions![index]

  return (
    <Card sx={{minWidth: 250, flex: 1, display: 'flex'}}>
      <CardActionArea component={Link} to={`/auction/${auction.auction.auctionId}`} sx={{flex: 1}}>
        <Box sx={{position: 'relative'}}>
          <PhotoBlobView
            image={auction.photo.imageData}
            imageBuilder={(src) => (
              <CardMedia
                component='img'
                height={140}
                src={src}
                alt={auction.auction.title}
              />
            )}
            defaultBuilder={() => (
              <CardMedia component='div'>
                <Skeleton height={140} variant="rectangular" animation={false}/>
              </CardMedia>
            )}
          />

          <AuctionListItemClosingChip auction={auction}/>
        </Box>

        <CardContent>
          <Typography variant='h6' component='div'>{auction.auction.title}</Typography>
          <AuctionListItemCategory auction={auction}/>
          <Box sx={{paddingTop: 1}}>
            <UserInfoRow userId={auction.auction.sellerId}/>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end'
          }}>
            <Box sx={{flex: 1}}>
              <Typography variant='overline' component='div'>{(auction.auction.highestBid !== null && auction.auction.highestBid >= auction.auction.reserve) ? 'Reserve Met' : 'Reserve'}</Typography>
              <Typography variant='button' component='div'>${auction.auction.reserve}.00</Typography>
            </Box>
            {(auction.auction.highestBid !== null) && (
              <Box sx={{flex: 1, textAlign: 'right'}}>
                <Typography variant='overline' component='div'>Highest Bid</Typography>
                <Typography variant='button' component='div'>${auction.auction.highestBid}.00</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
})

interface AuctionListItemSubComponentProps {
  auction: AuctionListPageAuction
}

const AuctionListItemCategory: React.FC<AuctionListItemSubComponentProps> = observer(({auction}) => {
  const store = useAuctionListStore()

  if (store.categories.isLoading) {
    return (
      <Tooltip title='Loading Category'>
        <Typography variant='body1'><Skeleton/></Typography>
      </Tooltip>
    )
  }
  else {
    const categoryName = store.categories.categoriesById?.get(auction.auction.categoryId)

    if (categoryName !== undefined) {
      return (
        <Typography variant='body1'><LocalOffer fontSize='inherit' sx={{verticalAlign: 'middle'}}/> {categoryName}</Typography>
      )
    }
    else {
      return (
        <Tooltip title={`Category ID is: ${auction.auction.categoryId}`}>
          <Typography variant='body1' color='red' sx={{fontStyle: 'italic'}}>
            Failed to find category.
          </Typography>
        </Tooltip>
      )
    }
  }
})

const AuctionListItemClosingChip: React.FC<AuctionListItemSubComponentProps> = observer(({auction}) => {
  const endDate = auction.endDate
  const isClosed = new Date() > endDate

  let message
  if (isClosed) {
    message = `Closed on ${endDate.toLocaleString()}`
  }
  else {
    const timeLeft = intervalToDuration({
      start: new Date(),
      end: endDate
    })

    if (timeLeft.days! > 1) {
      message = `Closes in ${timeLeft.days} days`
    }
    else if (timeLeft.days === 1) {
      message = 'Closes tomorrow'
    }
    else {
      // Mere hours, minutes, and seconds left
      if (timeLeft.hours !== 0) {
        message = `Closes in ${timeLeft.hours} hours`
      }
      else if (timeLeft.minutes !== 0) {
        message = `Closes in ${timeLeft.minutes} minutes`
      }
      else if (timeLeft.seconds !== 0) {
        message = `Closes in ${timeLeft.seconds} seconds`
      }
      else {
        message = `Closes on ${endDate.toLocaleString()}`
      }
    }
  }

  return (
    <Tooltip title={endDate.toLocaleString()}>
      <Chip
        sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          cursor: 'pointer'
        }}
        size='small'
        color="primary"
        label={message}
      />
    </Tooltip>
  )
})