import React, {useCallback} from "react";
import {observer} from "mobx-react-lite";
import {useAuctionListStore} from "../auction_list_store_context";
import {IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {ChevronLeft, ChevronRight, FirstPage, LastPage} from "@mui/icons-material";
import {AuctionListPageStore} from "../AuctionListPageStore";

export const AuctionPaginationControl: React.FC = observer(() => {
  const store = useAuctionListStore()
  const page = store.page

  const onFirstPageClick = useCallback(() => {
    store.goToFirstPage()
  }, [store])

  const onLeftClick = useCallback(() => {
    store.goToPrevPage()
  }, [store])

  const onRightClick = useCallback(() => {
    store.goToNextPage()
  }, [store])

  const onLastPageClick = useCallback(() => {
    store.goToLastPage()
  }, [store])

  return (
    <Stack spacing={0}>
      <Typography variant='caption' color='text.secondary'>{page.totalResultCount} Results</Typography>
      {(page.maxPageIndex === 0) ? undefined : (
        // Show the page navigation stuff
        <Stack direction='row' spacing={1} sx={{alignItems: 'center'}}>

          {(page.pageIndex > 0) && (
            <>
              <Tooltip title='Go to first page'>
                <IconButton size='small' onClick={onFirstPageClick}><FirstPage/></IconButton>
              </Tooltip>
              <Tooltip title='Go to previous page'>
                <IconButton size='small' onClick={onLeftClick}><ChevronLeft/></IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title={`Showing results ${page.pageIndex * AuctionListPageStore.PAGE_SIZE + 1} - ${page.pageIndex * AuctionListPageStore.PAGE_SIZE + (page.auctions?.length ?? 0)}`}>
            <Typography variant='body1' color='text.secondary'>Page {page.pageIndex + 1} / {page.maxPageIndex! + 1}</Typography>
          </Tooltip>

          {(page.pageIndex < page.maxPageIndex!) && (
            <>
              <Tooltip title='Go to next page'>
                <IconButton size='small' onClick={onRightClick}><ChevronRight/></IconButton>
              </Tooltip>
              <Tooltip title='Go to last page'>
                <IconButton size='small' onClick={onLastPageClick}><LastPage/></IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      )}
    </Stack>
  )
})