import React from "react";
import {Box, Card, CardHeader, Grid, LinearProgress, Typography} from "@mui/material";
import {observer} from "mobx-react-lite";

export const IndexPage: React.FC = observer(() => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column'
      }}
    >
      {/*<LinearProgress sx={{width: '100%'}} color='secondary' variant='query'/>*/}

      <Box  sx={{width: '100%', maxWidth: 'xl', marginTop: 3, marginBottom: 3}}>
        <Typography variant='h3' sx={{marginBottom: 1}}>Browse Auctions</Typography>

        <Grid
          container
          spacing={1}
        >
          <Grid item xs={12} lg={3}>
            <Card sx={{width: '100%'}}>
              <CardHeader title="Filters" />
            </Card>
          </Grid>

          <Grid item xs={12} lg={9}>
            <Card sx={{width: '100%'}}>
              {/*<LinearProgress/>*/}
              <Typography variant='body1'>Hello, I'm an auction</Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
})