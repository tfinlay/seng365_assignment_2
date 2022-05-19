import React from "react";
import {Card, CardContent, CardHeader, LinearProgress} from "@mui/material";
import {SxProps} from "@mui/system";
import {Theme} from "@mui/material/styles";

interface FormCardProps {
  title: string
  subtitle?: string
  loading: boolean
  onSubmit: (evt: React.FormEvent) => any

  actions?: React.ReactNode

  cardStyles?: SxProps<Theme>
  cardHeaderStyles?: SxProps<Theme>
  cardContentStyles?: SxProps<Theme>
}
export const FormCard: React.FC<React.PropsWithChildren<FormCardProps>> = (props) => {
  const {
    children,
    title,
    subtitle,
    loading,
    onSubmit,

    cardStyles,
    cardHeaderStyles,
    cardContentStyles,

    actions
  } = props

  return (
    <Card sx={{minWidth: 'sm', maxWidth: 450, width: '100%', ...cardStyles}}>
      {(loading) ? <LinearProgress/> : null}

      <form onSubmit={onSubmit}>
        <CardHeader title={title} subtitle={subtitle} sx={cardHeaderStyles}/>

        <CardContent sx={{display: 'flex', gap: 2, flexDirection: 'column', ...cardContentStyles}}>
          {children}
        </CardContent>

        {actions}
      </form>
    </Card>
  )
}