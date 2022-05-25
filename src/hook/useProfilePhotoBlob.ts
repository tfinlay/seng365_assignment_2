import {observable} from "mobx";
import {useEffect, useState} from "react";
import {PhotoStore} from "../store/PhotoStore";

const makePathForUserId = (userId: number) => `/users/${userId}/image`
const makeStore = (userId: number) => {
  const store = new PhotoStore(makePathForUserId(userId))
  store.fetchImage()
  return observable(store, {}, {autoBind: true})
}

/**
 * MUST BE USED WITHIN AN OBSERVER
 */
export const useProfilePhotoBlob = (userId: number) => {
  const [store, setStore] = useState(() => makeStore(userId))

  useEffect(() => {
    if (store.apiPath !== makePathForUserId(userId)) {
      setStore(makeStore(userId))
    }
  }, [store, userId])

  return store
}