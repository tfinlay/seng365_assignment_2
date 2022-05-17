import React, {useMemo} from 'react';
import {Container, createTheme, CssBaseline, ThemeProvider, Typography} from "@mui/material";
import {useSystemTheme} from "./hook/useSystemTheme";

function App() {
  const systemTheme = useSystemTheme()

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: systemTheme
      }
    }),
    [systemTheme]
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>

      <Container>
        <Typography variant="h1">Welcome to SENG365!</Typography>
        <Typography variant="body1">The theme is {theme.palette.mode}</Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;
