import {RegisterStore} from "../page/register/RegisterStore";
import React, {useCallback, useState} from "react";
import {observer} from "mobx-react-lite";
import {IconButton, InputAdornment, TextField, Tooltip} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ObservableFormValue} from "../util/ObservableFormValue";

interface PasswordFieldProps {
  passwordStore: ObservableFormValue<string>
  loading: boolean
  labelText?: string
  externalErrorText?: string
  autoFocus?: boolean
  tabIndex?: number
}
export const PasswordField: React.FC<PasswordFieldProps> = observer(({passwordStore: password, loading, labelText, externalErrorText, autoFocus, tabIndex}) => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false)

  const togglePasswordVisible = useCallback(() => {
    setPasswordVisible((current) => !current)
  }, [setPasswordVisible])

  const onPasswordChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    password.setValue(evt.target.value)
  }, [password])

  return (
    <TextField
      id={`password-${labelText ?? ''}`}
      label={labelText ?? 'Password'}
      variant='outlined'
      type={(passwordVisible) ? "text" : "password"}
      required
      disabled={loading}
      autoFocus={autoFocus}
      tabIndex={tabIndex}

      value={password.value}
      onChange={onPasswordChange}
      error={password.hasError || externalErrorText !== undefined}
      helperText={externalErrorText ?? password.error}

      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <Tooltip title={`${(passwordVisible) ? 'Hide' : 'Show'} password`}>
              <IconButton
                tabIndex={-1}
                aria-label="Toggle password visibility"
                onClick={togglePasswordVisible}
              >
                {(passwordVisible) ? <VisibilityOff/> : <Visibility/>}
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
  )
})