import React, {useEffect, useState} from "react";

interface PhotoBlobViewProps {
  image: Blob | null | undefined
  imageBuilder: (imageUrl: string) => React.ReactElement<any, any>
  defaultBuilder: () => React.ReactElement<any, any>
}
export const PhotoBlobView: React.FC<PhotoBlobViewProps> = ({image: imageBlob, imageBuilder, defaultBuilder}) => {
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
    return defaultBuilder()
  }
  else {
    return imageBuilder(image)
  }
}