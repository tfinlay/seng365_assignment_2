export const notEmptyFieldValidator = (value: string) => {
  if (!value) {
    return "This field is required."
  }
  return null
}

export const emailFieldValidator = (value: string) => {
  const notEmptyRes = notEmptyFieldValidator(value)
  if (notEmptyRes === null) {
    if (!/^.*@.+$/.test(value) || value.length > 128) {
      return "Invalid email."
    }
  }
  return notEmptyRes
}