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

interface AuctionListItemProps {
  index: number
}
export const AuctionListItem: React.FC<AuctionListItemProps> = observer(({index}) => {
  const store = useAuctionListStore()
  const auction = store.page.auctions![index]

  return (
    <Card sx={{height: 300, minWidth: 250, flex: 1}}>
      <CardActionArea component={Link} to={`/auction/${auction.auction.auctionId}`}>
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

          <AuctionListItemClosingChip endDate={auction.endDate}/>
        </Box>

        <CardContent>
          <Typography variant='h6' component='div'>{auction.auction.title}</Typography>
          <Typography variant='body1'><LocalOffer fontSize='inherit' sx={{verticalAlign: 'middle'}}/> {auction.auction.categoryId}</Typography> {/* TODO: Load category names! */}
        </CardContent>
      </CardActionArea>
    </Card>
  )
})

interface AuctionListItemClosingChipProps {
  endDate: Date
}
const AuctionListItemClosingChip: React.FC<AuctionListItemClosingChipProps> = observer(({endDate}) => {
  const theme = useTheme()

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
          backgroundColor: alpha(theme.palette.primary[theme.palette.mode], 0.8),
          cursor: 'pointer'
        }}
        size='small'
        color="primary"
        label={message}
      />
    </Tooltip>
  )
})