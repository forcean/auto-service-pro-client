import { RESPONSE } from "../enum/response.enum";

// export interface IBaseResponse<T> {
//   message: string;
//   resultCode: number;
//   status: string;
//   data: T;
// }

export interface IBaseResponse<T> {
  developerMessage: string;
  resultCode: string;
  resultData: T;
  /** Backend currently returns this misspelled property for successful calls. */
  resultSatatus?: 'Success';
  resultStatus?: 'Error';
  error?: IDataError;
  hasMore?: boolean;
  total?: number;
}

export interface IDataError {
  code: string;
  message: string;
}
