import React, {useMemo} from 'react';
import {createTheme, CssBaseline, Paper, ThemeProvider} from "@mui/material";
import {useSystemTheme} from "./hook/useSystemTheme";
import {NavBar} from "./component/NavBar";
import {BrowserRouter as Router, Navigate, Route, Routes} from "react-router-dom";
import {AuctionListPageRoot} from "./page/auction_list/auction_list";
import {NotFoundPage} from "./page/404";
import {RegisterPage} from "./page/register/register";
import {LoginPage} from "./page/login";
import {observer} from "mobx-react-lite";
import {ApplicationStore} from "./store/ApplicationStore";
import {OtherUserProfilePage, ProfilePage} from "./page/profile/profile";
import {AuctionViewPage} from "./page/auction_view/auction_view";
import {AuctionPageLoader} from "./component/auction/AuctionPageLoader";
import {CreateAuctionPage} from "./page/create_auction/create_auction";
import { MyAuctionsPage } from './page/my_auctions/my_auctions';

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
      <Route index element={<AuctionListPageRoot/>}/>
      {!isLoggedIn && <Route path="/login" element={<LoginPage/>}/>}
      {!isLoggedIn && <Route path="/register" element={<RegisterPage/>}/>}

      {isLoggedIn && <Route path="/profile" element={<ProfilePage user={ApplicationStore.main.user!}/>} />}
      {isLoggedIn && <Route path={`/profile/${ApplicationStore.main.user!.id}`} element={<Navigate to='/profile' replace/>}/>}
      <Route path="/profile/:userId" element={<OtherUserProfilePage/>}/>

      {isLoggedIn && <Route path="/auction/create" element={<CreateAuctionPage/>}/>}
      <Route path="/auction/:auctionId" element={<AuctionPageLoader pageBuilder={(auction) => <AuctionViewPage auction={auction}/>}/>}/>

      {isLoggedIn && <Route path="/my_auctions" element={<MyAuctionsPage/>}/>}

      <Route path="*" element={<NotFoundPage/>} />
    </Routes>
  )
})

export default App;
