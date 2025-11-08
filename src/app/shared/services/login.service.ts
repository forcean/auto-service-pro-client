import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ILoginResponse, ILoginUser, IReqRefreshToken, IResponseToken } from '../interface/auth.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { HttpService } from '../../core/services/http-service/http.service';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(
    private httpService: HttpService,
  ) { }

  private PREFIX_AUTH = ApiPrefix.ServiceManagement;

  async login(data: ILoginUser) {
    const uri = this.PREFIX_AUTH + `/login`;
    try {
      const response = await
        this.httpService.post<ILoginResponse>(uri, data, true);
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
      const uri = this.PREFIX_AUTH + `/auth/revoke`;
      const response = await this.httpService.post<any>(uri, {});
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
      const uri = this.PREFIX_AUTH + '/auth/refresh';
      const response = await this.httpService.post<IResponseToken>(uri, req, true);
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