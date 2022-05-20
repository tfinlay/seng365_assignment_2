import React, {useEffect, useState} from "react";
import {AccountCircle} from "@mui/icons-material";
import {SvgIconTypeMap} from "@mui/material/SvgIcon/SvgIcon";

interface ProfilePhotoBlobViewProps {
  image: Blob | null | undefined
  size: number,
  color?: SvgIconTypeMap["props"]["color"]
}
export const ProfilePhotoBlobView: React.FC<ProfilePhotoBlobViewProps> = ({ image: imageBlob, size, color }) => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    if (!imageBlob) {
      setImage(null)
    }
    else {
      const url = URL.createObjectURL(imageBlob)
      setImage(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [imageBlob])

  if (image === null) {
    return <AccountCircle sx={{fontSize: size}} color={color}/>
  }
  else {
    return (
      <img
        src={image}
        style={{width: size, height: size, borderRadius: size/2}}
        alt="Profile"
      />
    )
  }
}