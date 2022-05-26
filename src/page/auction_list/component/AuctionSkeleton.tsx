import React from "react";
import {Box, Skeleton} from "@mui/material";

interface AuctionSkeletonProps {
  opacity?: number,
}

export const AuctionSkeleton: React.FC<AuctionSkeletonProps> = ({opacity}) => {
  return (
    <Box sx={{opacity: opacity}}>
      <Skeleton variant="rectangular" height={300} width={250} sx={{borderRadius: 2}}/>
    </Box>
  )
}