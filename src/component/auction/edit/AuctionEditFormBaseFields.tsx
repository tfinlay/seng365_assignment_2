import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionEditFormStore} from "./auction_edit_form_store_context";
import {TextFieldProps} from "@mui/material/TextField/TextField";
import {
  Box, Button,
  FormControl, InputAdornment,
  InputLabel, MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip, Typography
} from "@mui/material";
import {useAuctionCategoriesStore} from "../../../store/auction_categories_store_context";
import {LoadStatusError} from "../../../util/LoadStatus";
import {ErrorPresenter} from "../../ErrorPresenter";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {enNZ} from "date-fns/locale";

export const AuctionEditFormBaseFields: React.FC = observer(() => {
  const store = useAuctionEditFormStore()

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

  return (
    <>
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
    </>
  )
})


const EndDatePickerRenderInputComponent: React.FC<TextFieldProps> = observer((props) => {
  const store = useAuctionEditFormStore()

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

  const store = useAuctionEditFormStore()
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