import {
  EQuotationStatus,
  IQuotationListItem,
} from './quotation.interface';

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

export interface ISearchQuotationCriteria {
  keyword?: string;
  status?: EQuotationStatus | '';
}

export interface IQueryListQuotation
  extends ISearchQuotationCriteria {
  page: number;
  limit: number;
  sort?: string;
}