import React, { createContext, useContext } from "react";
import {CreateAuctionStore} from "./CreateAuctionStore";

const CreateAuctionStoreContext = createContext<CreateAuctionStore | null>(null)

interface CreateAuctionStoreProviderProps {
  store: CreateAuctionStore
}
export const CreateAuctionStoreProvider: React.FC<React.PropsWithChildren<CreateAuctionStoreProviderProps>> = ({store, children}) => {
  return (
    <CreateAuctionStoreContext.Provider value={store}>
      {children}
    </CreateAuctionStoreContext.Provider>
  )
}

export const useCreateAuctionStore = (): CreateAuctionStore => {
  const store = useContext(CreateAuctionStoreContext)

  if (store === null) {
    throw new Error("useCreateAuctionStore must be called only within a CreateAuctionStoreProvider context.")
  }

  return store
}