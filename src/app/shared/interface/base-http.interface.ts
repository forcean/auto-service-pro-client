import { RESPONSE } from "../enum/response.enum";

// export interface IBaseResponse<T> {
//   message: string;
//   resultCode: number;
//   status: string;
//   data: T;
// }

export interface IBaseResponse<T> {
  message: string;
  resultCode: string;
  data: T;
  status?: 'success' | 'error';
  error?: IDataError;
  hasMore?: boolean;
  total?: number;
}

export interface IDataError {
  code: string;
  message: string;
}