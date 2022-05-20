import React from "react";
import {observer} from "mobx-react-lite";
import {useProfileStore} from "../profile_store_context";
import {Box, Button} from "@mui/material";

export const ProfileDetailsEditor: React.FC = observer(() => {
  const store = useProfileStore()

  return (
    <Box>

    </Box>
  )
})