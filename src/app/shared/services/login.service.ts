import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ILoginResponse, ILoginUser, IReqRefreshToken, IResponseToken } from '../interface/auth.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { ApiPrefix } from '../enum/api-prefix.enum';
@Injectable({ providedIn: 'root' })

export class LoginService {

  constructor(
    private http: HttpClient,
  ) { }

  private PREFIX_AUTH = ApiPrefix.ServiceManagement;

  async login(data: ILoginUser): Promise<IBaseResponse<ILoginResponse>> {
    const url = this.PREFIX_AUTH + `/login`;

    try {
      const response = await firstValueFrom(
        this.http.post<IBaseResponse<ILoginResponse>>(url, data, { withCredentials: true })
      );
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<ILoginResponse>;
      }
      throw error;
    }
  }

  async logout() {
    try {
      const uri = this.PREFIX_AUTH + `/token/revoke`;
      const response = await this.http.post<any>(uri, {});
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async getRefreshToken(req: IReqRefreshToken) {
    try {
      const uri = this.PREFIX_AUTH + '/token/refresh';
      const response = await this.http.post<IResponseToken>(uri, req, { withCredentials: true });
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResponseToken>;
      } else {
        throw error;
      }
    }
  }

}