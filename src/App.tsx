import React, {useMemo} from 'react';
import {Container, createTheme, CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {useSystemTheme} from "./hook/useSystemTheme";
import {NavBar} from "./component/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {IndexPage} from "./page";
import {NotFoundPage} from "./page/404";
import {RegisterPage} from "./page/register/register";
import {LoginPage} from "./page/login";
import {observer} from "mobx-react-lite";
import {ApplicationStore} from "./store/ApplicationStore";
import {ProfilePage} from "./page/profile/profile";

const App = () => {
  const systemTheme = useSystemTheme()

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: systemTheme,
        neutral: {
          main: '#fff'
        }
      }
    }),
    [systemTheme]
  )

  console.log(systemTheme)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>

      <Paper sx={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
        <Router>
          <NavBar/>

          <AppRoutes/>
        </Router>
      </Paper>
    </ThemeProvider>
  );
}

const AppRoutes: React.FC = observer(() => {
  const isLoggedIn = ApplicationStore.main.isLoggedIn

  return (
    <Routes>
      <Route index element={<IndexPage/>}/>
      {!isLoggedIn && <Route path="/login" element={<LoginPage/>}/>}
      {!isLoggedIn && <Route path="/register" element={<RegisterPage/>}/>}
      {isLoggedIn && <Route path="/profile" element={<ProfilePage/>} />}
      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  )
})

export default App;
