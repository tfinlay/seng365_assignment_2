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

export const CreateAuctionPage: React.FC = observer(() => {
  const store = useLocalObservable(() => new CreateAuctionStore())
  const categories = store.categories

  return (
    <Centred>
      <CreateAuctionStoreProvider store={store}>
        <AuctionCategoriesStoreProvider store={categories}>
          <CreateAuctionPageContent/>
        </AuctionCategoriesStoreProvider>
      </CreateAuctionStoreProvider>
    </Centred>
  )
})

const CreateAuctionPageContent: React.FC = observer(() => {
  const store = useCreateAuctionStore()
  const navigate = useNavigate()

  const onTitleChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.title.setValue(evt.target.value)
  }, [store])

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.description.setValue(evt.target.value)
  }, [store])

  const onDateChange = useCallback((newValue: Date | null) => {
    store.endDate.setValue(newValue)
  }, [store])

  const onReserveChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    store.reserve.setValue(evt.target.value)
  }, [store])

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

      <TextField
        id="create-auction-title"
        label='Title'
        variant='outlined'
        required
        disabled={store.isLoading}

        value={store.title.value}
        onChange={onTitleChange}
        error={store.title.hasError}
        helperText={store.title.error}
      />

      <CategoryPicker/>

      <TextField
        id="create-auction-description"
        label='Description'
        variant='outlined'
        required
        disabled={store.isLoading}

        multiline
        minRows={3}

        value={store.description.value}
        onChange={onDescriptionChange}
        error={store.description.hasError}
        helperText={store.description.error}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enNZ}>
        <DateTimePicker
          label="End Date"
          disabled={store.isLoading}

          onChange={onDateChange}
          value={store.endDate.value}
          renderInput={(params) => <EndDatePickerRenderInputComponent {...params}/>}
        />
      </LocalizationProvider>

      <TextField
        id="create-auction-reserve"
        label='Reserve ($)'
        required
        variant='outlined'
        disabled={store.isLoading}

        value={store.reserve.value}
        onChange={onReserveChange}
        error={store.reserve.hasError}
        helperText={store.reserve.error}

        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>$</InputAdornment>
          )
        }}
      />

      {(store.saveAuctionStatus instanceof LoadStatusError) ? (
        <Typography variant="body1" sx={{color: 'error.main'}}><ErrorPresenter error={store.saveAuctionStatus.error}/></Typography>
      ) : undefined}
    </FormCard>
  )
})

const EndDatePickerRenderInputComponent: React.FC<TextFieldProps> = observer((props) => {
  const store = useCreateAuctionStore()

  return (
    <TextField
      required
      {...props}
      helperText={props.helperText ?? store.endDate.error ?? props.inputProps?.placeholder}
      error={props.error || store.endDate.hasError}
    />
  )
})

const CategoryPicker: React.FC = observer(() => {
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const store = useCreateAuctionStore()
  const categories = useAuctionCategoriesStore()

  const onChange = useCallback((evt: SelectChangeEvent<number>) => {
    const value = evt.target.value

    let actualValue: number | null
    if (typeof value === 'string') {
      actualValue = parseInt(value)
      if (isNaN(actualValue)) {
        actualValue = null
      }
    }
    else {
      actualValue = value
    }

    store.category.setValue(actualValue)
  }, [store])

  if (categories.isLoading) {
    return (
      <Tooltip title='Loading categories...'>
        <Skeleton variant='rectangular' height={ITEM_HEIGHT} sx={{borderRadius: 1}}/>
      </Tooltip>
    )
  }
  else if (categories.categoriesById !== null) {
    return (
      <FormControl sx={{marginTop: 1}}>
        <InputLabel id="create-auction-category-label" required>Category</InputLabel>
        <Select
          labelId="create-auction-category-label"
          id="create-auction-category-select"
          value={store.category.value ?? '' as any as number}
          onChange={onChange}
          required
          input={<OutlinedInput label="Category" required/>}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250
              }
            }
          }}
        >
          {Array.from(categories.categoriesById.entries()).map(([id, name]) => (
            <MenuItem key={id} value={id}>{name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  else {
    return (
      <Box sx={{padding: 1}}>
        <Typography variant="subtitle1" color="error">Failed to load category information:</Typography>
        <Typography variant="body1" color="error">
          {(categories.loadStatus instanceof LoadStatusError) ? (
            <ErrorPresenter error={categories.loadStatus.error}/>
          ) : <span>Entered an unexpected state.</span>}
        </Typography>
        <Button onClick={() => categories.fetchCategories()}>Try again</Button>
      </Box>
    )
  }
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