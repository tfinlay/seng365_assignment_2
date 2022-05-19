import React, {useEffect, useState} from "react";
import {AccountCircle} from "@mui/icons-material";

interface ProfilePhotoBlobViewProps {
  image: Blob | null | undefined
  size: number
}
export const ProfilePhotoBlobView: React.FC<ProfilePhotoBlobViewProps> = ({ image: imageBlob, size }) => {
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
    return <AccountCircle sx={{fontSize: size}}/>
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