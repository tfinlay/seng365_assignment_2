import React, {useMemo} from 'react';
import {Container, createTheme, CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {useSystemTheme} from "./hook/useSystemTheme";
import {NavBar} from "./component/NavBar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {IndexPage} from "./page";
import {NotFoundPage} from "./page/404";
import {RegisterPage} from "./page/register/register";
import {LoginPage} from "./page/login";

function App() {
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

          <Routes>
            <Route index element={<IndexPage/>}/>
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="*" element={<NotFoundPage/>} />
          </Routes>
        </Router>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
