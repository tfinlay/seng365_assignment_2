import React, {useCallback} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {ObservableFormValue} from "../util/ObservableFormValue";
import {emailFieldValidator, notEmptyFieldValidator} from "../util/validation";
import {CentredForm} from "../component/CentredForm";
import {Box, Button, Card, CardActions, TextField, Typography} from "@mui/material";
import {FormCard} from "../component/FormCard";
import {ApplicationStore} from "../store/ApplicationStore";
import {LoadStatusError, LoadStatusPending} from "../util/LoadStatus";
import {PasswordField} from "../component/PasswordField";
import {useNavigate} from "react-router-dom";
import {ErrorPresenter} from "../component/ErrorPresenter";

export const LoginPage: React.FC = observer(() => {
  if (ApplicationStore.main.isLoggedIn) {
    return (
      <CentredForm>
        <Card sx={{minWidth: 'sm', maxWidth: 450, width: '100%'}}>
          <Typography variant="h6">You're already signed in!</Typography>
        </Card>
      </CentredForm>
    )
  }

  return <LoginPageContent/>
})

const LoginPageContent: React.FC = observer(() => {
  const navigate = useNavigate()
  const email = useLocalObservable(() => new ObservableFormValue<string>("", emailFieldValidator))
  const password = useLocalObservable(() => new ObservableFormValue<string>("", notEmptyFieldValidator))

  const onEmailChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    email.setValue(evt.target.value)
  }, [email])

  const onSubmit = useCallback( async (evt: React.FormEvent) => {
    evt.preventDefault()
    evt.stopPropagation()

    if (email.validate() && password.validate()) {
      await ApplicationStore.main.logIn(email.value, password.value)
      if (ApplicationStore.main.isLoggedIn) {
        navigate("/")
      }
    }
  }, [navigate, email, password])

  const isLoading = ApplicationStore.main.logInStatus instanceof LoadStatusPending

  return (
    <CentredForm>
      <FormCard
        title='Log In'
        loading={isLoading}
        onSubmit={onSubmit}
        actions={(
          <CardActions sx={{display: 'flex', flexDirection: 'row-reverse'}}>
            <Button type="submit" variant="contained" disabled={isLoading}>Submit</Button>
          </CardActions>
        )}
      >
        <TextField
          id="email"
          label='Email'
          variant='outlined'
          type="email"
          required
          disabled={isLoading}

          value={email.value}
          onChange={onEmailChange}
          error={email.hasError}
          helperText={email.error}
        />

        <PasswordField passwordStore={password} loading={isLoading} />

        {(ApplicationStore.main.logInStatus instanceof LoadStatusError) ? (
          <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={ApplicationStore.main.logInStatus.error}/></Typography>
        ) : undefined}
      </FormCard>
    </CentredForm>
  )
})