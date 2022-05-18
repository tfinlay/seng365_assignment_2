import React from "react";
import {ServerError} from "../util/ServerError";

interface ErrorPresenterProps {
  error: unknown
}
export const ErrorPresenter: React.FC<ErrorPresenterProps> = ({error}) => {
  if (error instanceof ServerError) {
    return (
      <>{error.message}</>
    )
  }
  else if (error instanceof Error) {
    return (
      <>{error.name}: {error.message}</>
    )
  }
  else {
    return (
      <>An unknown error occurred: {error}</>
    )
  }
}