import {action, computed, makeObservable, observable} from "mobx";

type FormValueErrorCallback<T> = (value: T) => string | null

export class ObservableFormValue<T = string> {
  value: T
  valueEdited: boolean = false
  protected errorGetter: FormValueErrorCallback<T>

  constructor(initialValue: T, errorGetter: FormValueErrorCallback<T>) {
    makeObservable(this, {
      value: observable,
      valueEdited: observable,

      resetEditedState: action,
      setValue: action,
      validate: action,

      error: computed,
      hasError: computed
    })

    this.value = initialValue
    this.errorGetter = errorGetter
  }

  resetEditedState(): void {
    this.valueEdited = false
  }

  setValue(value: T): void {
    this.value = value
    this.valueEdited = true
  }

  validate(): boolean {
    this.valueEdited = true
    return this.getError() === null
  }

  protected getError() {
    if (this.valueEdited) {
      return this.errorGetter(this.value)
    }
    else {
      return null
    }
  }

  get error(): string | null {
    return this.getError()
  }

  get hasError(): boolean {
    return this.error !== null
  }
}