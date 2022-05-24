import React, { createContext, useContext } from "react";
import {AuctionListStore} from "./AuctionListStore";

const AuctionListStoreContext = createContext<AuctionListStore | null>(null)

interface AuctionListStoreStoreProviderProps {
  store: AuctionListStore
}
export const AuctionListStoreProvider: React.FC<React.PropsWithChildren<AuctionListStoreStoreProviderProps>> = ({store, children}) => {
  return (
    <AuctionListStoreContext.Provider value={store}>
      {children}
    </AuctionListStoreContext.Provider>
  )
}

export const useAuctionListStore = (): AuctionListStore => {
  const store = useContext(AuctionListStoreContext)

  if (store === null) {
    throw new Error("useAuctionListStore must be called only within an AuctionListStoreProvider context.")
  }

  return store
}