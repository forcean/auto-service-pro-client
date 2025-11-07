import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, Observable } from 'rxjs';
import { IBaseResponse } from '../../../shared/interface/base-http.interface';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) { }

  get<T>(url: string, queryParams?: any, withCredentials = false) {
    let params = new HttpParams();

    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        const value = queryParams[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value);
        }
      });
    }

    return lastValueFrom(this.httpClient.get<IBaseResponse<T>>(url, { params, withCredentials }));
  }

  post<T>(url: string, body: any, withCredentials = false) {
    return lastValueFrom(this.httpClient.post<IBaseResponse<T>>(url, body, { withCredentials }));
  }

  put<T>(url: string, body: any, withCredentials = false) {
    return lastValueFrom(this.httpClient.put<IBaseResponse<T>>(url, body, { withCredentials }));
  }

  delete<T>(url: string, queryParams?: any, withCredentials = false) {
    let params = new HttpParams();

    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        const value = queryParams[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.append(key, value);
        }
      });
    }

    return lastValueFrom(this.httpClient.delete<IBaseResponse<T>>(url, { params, withCredentials }));
  }
}
