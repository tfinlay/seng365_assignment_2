export interface PageableAuctionStore {
  page: PageableAuctionStorePage

  goToNextPage(): Promise<void>
  goToPrevPage(): Promise<void>
  goToFirstPage(): Promise<void>
  goToLastPage(): Promise<void>
}

export interface PageableAuctionStorePage {
  readonly pageSize: number
  pageIndex: number

  totalResultCount: number | null

  get auctionCount(): number | null
  get maxPageIndex(): number | null
}