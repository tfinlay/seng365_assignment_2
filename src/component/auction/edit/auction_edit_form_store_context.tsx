import React, { createContext, useContext } from "react";
import {AuctionEditFormStore} from "./AuctionEditFormStore";

const AuctionEditFormStoreContext = createContext<AuctionEditFormStore | null>(null)

interface AuctionEditFormStoreProviderProps {
  store: AuctionEditFormStore
}
export const AuctionEditFormStoreProvider: React.FC<React.PropsWithChildren<AuctionEditFormStoreProviderProps>> = ({store, children}) => {
  return (
    <AuctionEditFormStoreContext.Provider value={store}>
      {children}
    </AuctionEditFormStoreContext.Provider>
  )
}

export const useAuctionEditFormStore = (): AuctionEditFormStore => {
  const store = useContext(AuctionEditFormStoreContext)

  if (store === null) {
    throw new Error("useAuctionEditFormStore must be called only within an AuctionEditFormStoreProvider context.")
  }

  return store
}