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

export const passwordFieldValidator = (value: string) => {
  const notEmptyRes = notEmptyFieldValidator(value)
  if (notEmptyRes === null) {
    if (value.length < 6) {
      return "Password must be at least 6 characters long"
    }
  }
  return notEmptyRes
}
export const positiveIntegerValidator = (value: string) => {
  if (!/^\d+$/.test(value)) {
    return "Please enter a whole number"
  }

  const val = parseInt(value, 10)
  if (isNaN(val)) {
    return "Please enter a whole number"
  } else if (val <= 0) {
    return "Please enter a positive number"
  }
  return null
}