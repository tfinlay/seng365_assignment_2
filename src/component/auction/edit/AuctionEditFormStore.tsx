import {ObservableFormValue} from "../../../util/ObservableFormValue";
import {AuctionCategoriesStore} from "../../../store/AuctionCategoriesStore";

export interface AuctionEditFormStore {
  readonly title: ObservableFormValue
  readonly category: ObservableFormValue<number | null>
  readonly endDate: ObservableFormValue<Date | null>
  readonly description: ObservableFormValue
  readonly reserve: ObservableFormValue

  readonly categories: AuctionCategoriesStore

  get isLoading(): boolean
}