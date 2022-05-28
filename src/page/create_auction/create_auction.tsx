import React, {useCallback, useEffect, useState} from "react";
import {observer, useLocalObservable} from "mobx-react-lite";
import {CreateAuctionStore} from "./CreateAuctionStore";
import {FormCard} from "../../component/FormCard";
import {Centred} from "../../component/Centred";
import {AuctionCategoriesStoreProvider, useAuctionCategoriesStore} from "../../store/auction_categories_store_context";
import {CreateAuctionStoreProvider, useCreateAuctionStore} from "./create_auction_store_context";
import {
  Box,
  Button,
  CardActions, Checkbox,
  FormControl, IconButton, InputAdornment,
  InputLabel, ListItemText, MenuItem, OutlinedInput, Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip, Typography
} from "@mui/material";
import {DatePicker, DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {TextFieldProps} from "@mui/material/TextField/TextField";
import {enNZ} from "date-fns/locale";
import {useAuctionListStore} from "../auction_list/auction_list_store_context";
import {ErrorPresenter} from "../../component/ErrorPresenter";
import {LoadStatusError} from "../../util/LoadStatus";
import {AccountCircle, Cancel, Send, Upload} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {AuctionEditFormBaseFields} from "../../component/auction/edit/AuctionEditFormBaseFields";
import {AuctionEditFormStoreProvider} from "../../component/auction/edit/auction_edit_form_store_context";

export const CreateAuctionPage: React.FC = observer(() => {
  const store = useLocalObservable(() => new CreateAuctionStore())
  const categories = store.categories

  return (
    <Centred>
      <CreateAuctionStoreProvider store={store}>
        <AuctionCategoriesStoreProvider store={categories}>
          <AuctionEditFormStoreProvider store={store}>
            <CreateAuctionPageContent/>
          </AuctionEditFormStoreProvider>
        </AuctionCategoriesStoreProvider>
      </CreateAuctionStoreProvider>
    </Centred>
  )
})

const CreateAuctionPageContent: React.FC = observer(() => {
  const store = useCreateAuctionStore()
  const navigate = useNavigate()

  const onSubmit = useCallback(async (evt: React.FormEvent) => {
    evt.preventDefault()

    const auctionId = await store.validateAndSubmit()
    if (auctionId !== null) {
      navigate(`/auction/${auctionId}`)
    }
  }, [store, navigate])

  return (
    <FormCard
      title='Create Auction'
      loading={store.isLoading}
      onSubmit={(evt) => onSubmit(evt)}
      actions={(
        <CardActions sx={{display: 'flex', flexDirection: 'row-reverse'}}>
          <Button type="submit" variant="contained" disabled={store.isLoading}>Submit</Button>
        </CardActions>
      )}
    >
      <ImageSelectorAndPreview/>

      <AuctionEditFormBaseFields/>

      {(store.saveAuctionStatus instanceof LoadStatusError) ? (
        <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveAuctionStatus.error}/></Typography>
      ) : undefined}
    </FormCard>
  )
})


const ImageSelectorAndPreview: React.FC = observer(() => {
  const store = useCreateAuctionStore()

  const [lastUploadError, setLastUploadError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const onFileChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    if (evt.target.files && evt.target.files.length === 1) {
      store.photo.setValue(evt.target.files[0])
      setLastUploadError(null)
    }
    else {
      setLastUploadError("Please choose one file to upload.")
    }
  }, [store.photo])

  useEffect(() => {
    if (store.photo.value === null) {
      setImagePreview(null)
    }
    else {
      const url = URL.createObjectURL(store.photo.value)
      setImagePreview(url)
      return () => {
        URL.revokeObjectURL(url)
      }
    }
  }, [store.photo.value])

  const hasError = store.photo.hasError || lastUploadError !== null

  return (
    <>
      <input
        hidden

        disabled={store.isLoading}

        onChange={onFileChange}

        type="file"
        accept="image/jpeg,image/gif,image/png"
        id="create-auction-upload-image"
      />

      <Box sx={{textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1}}>
        <Box>
          {(store.photo.value !== null && imagePreview !== null) ? (
            <img
              src={imagePreview}
              style={{width: '100%', maxHeight: 250, objectFit: 'contain'}}
              alt="Preview of auction item"
            />
          ) : (
            <Skeleton variant='rectangular' sx={{width: '100%'}} height={250} animation={false}/>
          )}
        </Box>

        {(hasError) ? (
          <Typography variant="body1" sx={{color: 'error.main'}}>{lastUploadError ?? store.photo.error}</Typography>
        ) : undefined}

        <label htmlFor="create-auction-upload-image">
          <Button component='span' disabled={store.isLoading}><Upload/> Upload Photo</Button>
        </label>
      </Box>
    </>
  )
})