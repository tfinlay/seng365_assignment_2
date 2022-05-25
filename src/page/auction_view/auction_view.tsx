import React, {useEffect, useState} from "react";
import {observer} from "mobx-react-lite";
import {AuctionStore} from "../../store/AuctionStore";
import {PhotoBlobView} from "../../component/PhotoBlobView";
import {CircularProgress} from "@mui/material";
import {observable} from "mobx";
import {AuctionViewStore} from "./AuctionViewStore";

const makeStore = (auction: AuctionStore) => observable(new AuctionViewStore(auction), {}, {autoBind: true})

interface AuctionViewPageProps {
  auction: AuctionStore
}
export const AuctionViewPage: React.FC<AuctionViewPageProps> = observer(({auction}) => {
  const [store, setStore] = useState(() => makeStore(auction))

  useEffect(() => {
    if (store.auction !== auction) {
      setStore(makeStore(auction))
    }
  }, [store, auction])

  return (
    <PhotoBlobView image={auction.photo.imageData} imageBuilder={(src) => <img src={src}/>} defaultBuilder={() => <CircularProgress/>}/>
  )
})
