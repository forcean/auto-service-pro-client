import { IQuotationListItem } from './quotation.interface';

export interface ITableHeaderQuotation {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}

export interface IQuotationResultData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IQuotationListItem[];
}

/** Matches getQuotationWithPaginationDto on the service API. */
export interface IQueryListQuotation {
  page: number;
  limit: number;
  sort?: string;
}
