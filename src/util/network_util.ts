export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_URL ?? "http://localhost:4941/api/v1"
}

export const makeApiPath = (apiPath: string): string => {
  return process.env.REACT_APP_API_URL + apiPath
}