import React from "react";
import {Box, Card} from "@mui/material";


export const CentredForm: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1
      }}
    >
      {children}
    </Box>
  )
}