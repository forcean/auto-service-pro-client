export interface IServiceHistoryResultData {
  keyword?: string;
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  history: HistoryList[];
}

export interface HistoryList {
  id: string;
  date: string;
  mileage: string;
  service: string;
  mechanic: string;
}

export interface ITableHeaderServiceHistory {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}

export interface IQueryListHistory extends ISearchCriteria {
  page: number;
  limit: number;
  sort?: string;
}

export interface ISearchCriteria {
  licensePlate?: string;
}
