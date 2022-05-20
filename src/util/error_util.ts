import {ApplicationStore} from "../store/ApplicationStore";
import {ServerError} from "./ServerError";

export const handleServerError = (res: Response) => {
  if (res.status === 401) {
    // Looks like the user's token has expired. Lets log them out.
    ApplicationStore.main.logOut()
  }
  else {
    throw new ServerError(res.statusText)
  }
}