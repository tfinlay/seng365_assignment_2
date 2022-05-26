import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import {
  Button,
  Card,
  CardContent,
  CardHeader, Checkbox,
  FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import {runInAction} from "mobx";
import {AuctionListFiltersStatus} from "../AuctionListPageStore";
import {useAuctionCategoriesStore} from "../../../store/auction_categories_store_context";

export const AuctionFilters: React.FC = observer(() => {
  const store = useAuctionListStore()

  const onSubmit = useCallback((evt: React.FormEvent) => {
    evt.preventDefault()
    store.reloadPage()
  }, [store])

  const onClear = useCallback(() => {
    runInAction(() => {
      const priorSortBy = store.filters.sortBy
      store.filters.clear()
      store.filters.setSortBy(priorSortBy)

      store.reloadPage()
    })
  }, [store])

  return (
    <Card sx={{
      width: '100%',
      position: 'sticky',
      top: 5,
      maxHeight: 'calc(100vh - 10px)',
      overflowY: 'auto'
    }}>
      <CardHeader title="Filters" />
      <CardContent
        component='form'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          boxSizing: 'border-box',
          gap: 1
        }}
        onSubmit={onSubmit}
      >
        <AuctionFiltersFormSearchBox/>
        <AuctionFiltersFormCategoriesSelector/>
        <AuctionFiltersFormStatusSelector/>

        <Button type='submit' variant='contained' disabled={store.page.isLoading}>Apply</Button>
        <Button type='button' variant='outlined' disabled={store.page.isLoading} onClick={onClear}>Clear</Button>
      </CardContent>
    </Card>
  )
})

const AuctionFiltersFormSearchBox: React.FC = observer(() => {
  const store = useAuctionListStore()
  const filters = store.filters

  const onQueryChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    filters.setQueryString(evt.target.value)
  }, [filters])

  return (
    <>
      <TextField
        id="filter-search-query"
        label='Search'
        variant='outlined'
        sx={{flex: 1}}

        autoFocus

        value={filters.queryString}
        onChange={onQueryChange}
      />
    </>
  )
})

const AuctionFiltersFormCategoriesSelector: React.FC = observer(() => {
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;

  const categories = useAuctionCategoriesStore()
  const store = useAuctionListStore()
  const filters = store.filters

  const onChange = useCallback((evt: SelectChangeEvent<number[]>) => {
    const value = evt.target.value

    let actualValue: number[]
    if (typeof value === 'string') {
      actualValue = value.split(',').map(parseInt)
    }
    else {
      actualValue = value
    }

    filters.setCategoryIds(actualValue)
  }, [filters])

  if (categories.isLoading) {
    return (
      <Tooltip title='Loading categories...'>
        <Skeleton variant='rectangular'/>
      </Tooltip>
    )
  }
  else if (categories.categoriesById !== null) {
    return (
      <FormControl sx={{marginTop: 1}}>
        <InputLabel id="filter-categories-label">Categories</InputLabel>
        <Select
          labelId="filter-categories-label"
          id="filter-categories-select"
          multiple
          value={filters.categoryIds}
          onChange={onChange}
          input={<OutlinedInput label="Categories" />}
          renderValue={(selected) => selected.map(id => categories.categoriesById?.get(id) ?? 'UNKNOWN').join(', ')}
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
            <MenuItem key={id} value={id}>
              <Checkbox checked={filters.categoryIds.indexOf(id) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  else {
    return <Typography variant="subtitle1" color="error">Failed to load categories.</Typography>
  }
})

const AuctionFiltersFormStatusSelector: React.FC = observer(() => {
  const store = useAuctionListStore()
  const filters = store.filters

  const onChange = useCallback((evt: SelectChangeEvent) => {
    filters.setStatus(evt.target.value as AuctionListFiltersStatus)
  }, [filters])

  return (
    <FormControl sx={{marginTop: 1}}>
      <InputLabel id='AuctionFiltersFormOpenClosedSelector-label'>Auction Status</InputLabel>
      <Select
        labelId='AuctionFiltersFormOpenClosedSelector-label'
        id='AuctionFiltersFormOpenClosedSelector-input'
        value={store.filters.status}
        label='Auction Status'
        onChange={onChange}
      >
        <MenuItem value='ANY'>Any</MenuItem>
        <MenuItem value='OPEN'>Open Only</MenuItem>
        <MenuItem value='CLOSED'>Closed Only</MenuItem>
      </Select>
    </FormControl>
  )
})