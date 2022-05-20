import React, { createContext, useContext } from "react";
import {ProfileStore} from "./ProfileStore";

const ProfileStoreContext = createContext<ProfileStore | null>(null)

interface ProfileStoreProviderProps {
  store: ProfileStore
}
export const ProfileStoreProvider: React.FC<React.PropsWithChildren<ProfileStoreProviderProps>> = ({store, children}) => {
  return (
    <ProfileStoreContext.Provider value={store}>
      {children}
    </ProfileStoreContext.Provider>
  )
}

export const useProfileStore = (): ProfileStore => {
  const store = useContext(ProfileStoreContext)

  if (store === null) {
    throw new Error("useProfileStore must be called only within a ProfileStoreProvider context.")
  }

  return store
}