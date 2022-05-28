import {format} from "date-fns";

export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL ?? "http://localhost:4941/api/v1"
}

export const makeApiPath = (apiPath: string): string => {
  return process.env.REACT_APP_API_URL + apiPath
}

export const formatDateForAuction = (date: Date): string => {
  return format(date, "yyyy-MM-dd HH:mm:ss.SSS")
}