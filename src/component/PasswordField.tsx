import {RegisterStore} from "../page/register/RegisterStore";
import React, {useCallback, useState} from "react";
import {observer} from "mobx-react-lite";
import {IconButton, InputAdornment, TextField, Tooltip} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {ObservableFormValue} from "../util/ObservableFormValue";

interface PasswordFieldProps {
  passwordStore: ObservableFormValue<string>
  loading: boolean
}
export const PasswordField: React.FC<PasswordFieldProps> = observer(({passwordStore: password, loading}) => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false)

  const togglePasswordVisible = useCallback(() => {
    setPasswordVisible((current) => !current)
  }, [setPasswordVisible])

  const onPasswordChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    password.setValue(evt.target.value)
  }, [password])

  return (
    <TextField
      id="password"
      label='Password'
      variant='outlined'
      type={(passwordVisible) ? "text" : "password"}
      required
      disabled={loading}

      value={password.value}
      onChange={onPasswordChange}
      error={password.hasError}
      helperText={password.error}

      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <Tooltip title={`${(passwordVisible) ? 'Hide' : 'Show'} password`}>
              <IconButton
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