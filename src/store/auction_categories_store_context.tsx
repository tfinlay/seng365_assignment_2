import React, { createContext, useContext } from "react";
import {AuctionCategoriesStore} from "./AuctionCategoriesStore";

const AuctionCategoriesStoreContext = createContext<AuctionCategoriesStore | null>(null)

interface AuctionCategoriesStoreProviderProps {
  store: AuctionCategoriesStore
}
export const AuctionCategoriesStoreProvider: React.FC<React.PropsWithChildren<AuctionCategoriesStoreProviderProps>> = ({store, children}) => {
  return (
    <AuctionCategoriesStoreContext.Provider value={store}>
      {children}
    </AuctionCategoriesStoreContext.Provider>
  )
}

export const useAuctionCategoriesStore = (): AuctionCategoriesStore => {
  const store = useContext(AuctionCategoriesStoreContext)

  if (store === null) {
    throw new Error("useAuctionCategoriesStore must be called only within an AuctionCategoriesStoreProvider context.")
  }

  return store
}