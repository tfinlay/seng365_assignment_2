import React from "react";
import {Box, Card} from "@mui/material";


export const Centred: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        marginTop: 3,
        marginBottom: 3
      }}
    >
      {children}
    </Box>
  )
}