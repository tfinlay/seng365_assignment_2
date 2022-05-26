import React, { createContext, useContext } from "react";
import {AuctionSupplier} from "./AuctionListPageStore";

const AuctionSupplierContext = createContext<AuctionSupplier | null>(null)

interface AuctionSupplierProviderProps {
  store: AuctionSupplier
}
export const AuctionSupplierProvider: React.FC<React.PropsWithChildren<AuctionSupplierProviderProps>> = ({store, children}) => {
  return (
    <AuctionSupplierContext.Provider value={store}>
      {children}
    </AuctionSupplierContext.Provider>
  )
}

export const useAuctionSupplierStore = (): AuctionSupplier => {
  const store = useContext(AuctionSupplierContext)

  if (store === null) {
    throw new Error("useAuctionSupplierStore must be called only within an AuctionSupplierProvider context.")
  }

  return store
}