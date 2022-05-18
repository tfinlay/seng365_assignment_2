import React from "react";
import {AppBar, Box, Button, Container, Toolbar, Typography} from "@mui/material";
import {Link} from "react-router-dom";

export const NavBar: React.FC = () => {
  return (
    <Box sx={{flexGrow: 0, zIndex: 1}}>
      <AppBar position='static'>
        <Container maxWidth='xl'>
          <Toolbar disableGutters>
            <Link to="/" style={{color: 'white', textDecoration: 'none'}}><Typography variant='h6' color='inherit' noWrap component='div' sx={{paddingRight: 2, flexGrow: 0}}>
              Marketplace365
            </Typography></Link>

            <Box sx={{flexGrow: 1}}></Box>

            <Box sx={{flexGrow: 0}}>
              <Button
                size="large"
                component={Link}
                to="/register"
                variant="contained"
                color="secondary"
              >
                Register
              </Button>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  )
}