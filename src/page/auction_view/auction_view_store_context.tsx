import React, { createContext, useContext } from "react";
import {AuctionViewStore} from "./AuctionViewStore";

const AuctionViewStoreContext = createContext<AuctionViewStore | null>(null)

interface ProfileStoreProviderProps {
  store: AuctionViewStore
}
export const AuctionViewStoreProvider: React.FC<React.PropsWithChildren<ProfileStoreProviderProps>> = ({store, children}) => {
  return (
    <AuctionViewStoreContext.Provider value={store}>
      {children}
    </AuctionViewStoreContext.Provider>
  )
}

export const useAuctionViewStore = (): AuctionViewStore => {
  const store = useContext(AuctionViewStoreContext)

  if (store === null) {
    throw new Error("useAuctionViewStore must be called only within an AuctionViewStoreProvider context.")
  }

  return store
}