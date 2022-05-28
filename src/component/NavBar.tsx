import React, {useCallback, useState} from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {ApplicationStore} from "../store/ApplicationStore";
import {ProfilePhotoBlobView} from "./ProfilePhotoBlobView";

export const NavBar: React.FC = observer(() => {
  return (
    <Box sx={{flexGrow: 0, zIndex: 1}}>
      <AppBar position='static'>
        <Container maxWidth='xl'>
          <Toolbar disableGutters>
            <Link to="/" style={{color: 'white', textDecoration: 'none'}}><Typography variant='h6' color='inherit' noWrap component='div' sx={{paddingRight: 2, flexGrow: 0}}>
              Marketplace365
            </Typography></Link>

            <Box sx={{flexGrow: 1}}></Box>

            <Box sx={{flexGrow: 0, display: "flex", gap: 1}}>
              {(ApplicationStore.main.isLoggedIn) ? (
                <LoggedInActions/>
              ) : (
                <NotLoggedInActions/>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  )
})

const LoggedInActions: React.FC = observer(() => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const onClick = useCallback((evt: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(evt.currentTarget)
  }, [setAnchorEl])

  const onClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const onLogout = useCallback(async () => {
    onClose()
    try {
      await ApplicationStore.main.logOut()
      navigate("/")
    }
    catch (e: any) {
      alert(`Failed to log out due to error: ${e.message}. Please try again later.`)
    }
  }, [navigate, onClose])

  const onViewProfileClick = useCallback(() => {
    onClose()
    navigate("/profile")
  }, [onClose, navigate])

  const onViewMyAuctionsClick = useCallback(() => {
    onClose()
    navigate("/my_auctions")
  }, [onClose, navigate])

  return (
    <>
      <Button
        size="large"
        component={Link}
        to="/auction/create"
        variant="contained"
        color="secondary"
      >
        Create Auction
      </Button>

      <IconButton
        onClick={onClick}
        color="neutral"
        size='small'
      >
        <ProfilePhotoBlobView image={ApplicationStore.main.user?.profilePhoto?.imageData} size={35} />
      </IconButton>

      <Menu
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={onClose}
      >
        <MenuItem onClick={onViewProfileClick}>My Profile</MenuItem>
        <MenuItem divider onClick={onViewMyAuctionsClick}>My Auctions</MenuItem>
        <MenuItem onClick={onLogout}>Log Out</MenuItem>
      </Menu>
    </>
  )
})

const NotLoggedInActions: React.FC = () => {
  return (
    <>
      <Button
        size="large"
        component={Link}
        to="/register"
        variant="contained"
        color="secondary"
      >
        Register
      </Button>

      <Button
        size="large"
        component={Link}
        to="/login"
        variant="contained"
        color="secondary"
      >
        Log In
      </Button>
    </>
  )
}