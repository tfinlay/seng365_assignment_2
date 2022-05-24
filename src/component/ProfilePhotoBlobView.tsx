import React, {useEffect, useState} from "react";
import {AccountCircle} from "@mui/icons-material";
import {SvgIconTypeMap} from "@mui/material/SvgIcon/SvgIcon";
import {PhotoBlobView} from "./PhotoBlobView";

interface ProfilePhotoBlobViewProps {
  image: Blob | null | undefined
  size: number,
  color?: SvgIconTypeMap["props"]["color"]
}
export const ProfilePhotoBlobView: React.FC<ProfilePhotoBlobViewProps> = ({ image, size, color }) => {
  return (
    <PhotoBlobView
      image={image}
      imageBuilder={(imageUrl) => (
        <img
          src={imageUrl}
          style={{width: size, height: size, borderRadius: size/2}}
          alt="Profile"
        />
      )}
      defaultBuilder={() => <AccountCircle sx={{fontSize: size}} color={color}/>}
    />
  )
}