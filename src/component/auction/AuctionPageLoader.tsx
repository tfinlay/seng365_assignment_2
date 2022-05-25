import React, {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {AuctionStore} from "../../store/AuctionStore";

interface AuctionPageLoaderProps {
  pageBuilder: (auction: AuctionStore) => React.ReactElement
}
export const AuctionPageLoader: React.FC<AuctionPageLoaderProps> = ({pageBuilder}) => {
  const params = useParams<{auctionId: string}>()
  const auctionId = parseInt(params.auctionId ?? "NaN", 10)

  const [auction, setAuction] = useState(() => new AuctionStore(auctionId))

  useEffect(() => {
    if (auctionId !== auction.id) {
      setAuction(new AuctionStore(auctionId))
    }
  }, [auction.id, auctionId])

  if (isNaN(auctionId)) {
    return <Navigate to="/404" replace/>
  }

  return pageBuilder(auction)
}