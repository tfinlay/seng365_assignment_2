export abstract class LoadStatus {

}

export class LoadStatusNotYetAttempted extends LoadStatus {

}

export class LoadStatusPending extends LoadStatus {

}

export class LoadStatusDone extends LoadStatus {

}

export class LoadStatusError extends LoadStatus {
  error: unknown

  constructor(error: unknown) {
    super()
    this.error = error
  }
}