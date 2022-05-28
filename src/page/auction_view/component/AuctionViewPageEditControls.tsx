import React from "react";
import {observer} from "mobx-react-lite";
import {Box, Button} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {AuctionViewPageEditControlsDelete} from "./AuctionViewPageEditControlsDelete";
import {AuctionViewPageEditControlsEdit} from "./AuctionViewPageEditControlsEdit";

export const AuctionViewPageEditControls: React.FC = observer(() => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'row'}}>
      <AuctionViewPageEditControlsEdit/>

      <AuctionViewPageEditControlsDelete/>
    </Box>
  )
})

