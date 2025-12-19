import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { IReqCreateUser, IReqUpdateUser, IResponseUserDetail } from '../interface/user-management.interface';
import { IQueryListUser, IUserResultData } from '../interface/table-user-management.interface';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getListUser(params: IQueryListUser): Promise<IBaseResponse<IUserResultData>> {
    try {
      const uri = this.PREFIX_USER + `/users/getListUsers`;
      const response = await this.httpService.get<IUserResultData>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IUserResultData>;
      } else {
        throw error;
      }
    }
  }

  async getUserDetail(userId: string | null): Promise<IBaseResponse<IResponseUserDetail>> {
    try {
      const uri = this.PREFIX_USER + `/users/${userId}/detail`;
      const response = await this.httpService.get<IResponseUserDetail>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResponseUserDetail>;
      } else {
        throw error;
      }
    }
  }

  async CreateUser(body: IReqCreateUser) {
    try {
      const uri = this.PREFIX_USER + '/users/corps/register';
      const response = await this.httpService.post<any>(uri, body);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return error.error as IBaseResponse<IResponseMenu>;
      } else {
        throw error;
      }
    }
  }

  async resetPassword(pwd: string, userId: string) {
    try {
      const body = {
        painTextPassword: pwd
      }
      const url = this.PREFIX_USER + `/users/corps/${userId}/resetPassword`;
      // const url = this.PREFIX_USER + `/users/${userId}/resetPassword`;
      const response = await this.httpService.patch<any>(url, body);
      return response
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async updateUserDetail(body: IReqUpdateUser, userId: string) {
    try {
      const url = this.PREFIX_USER + `/users/${userId}/update`;
      const response = await this.httpService.patch<any>(url, body);
      return response
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async deleteUser(userId: string) {
    try {
      const uri = this.PREFIX_USER + `/users/corps/${userId}/delete`;
      // const uri = this.PREFIX_USER + `/corps/users/${userId}/delete`;
      const response = await this.httpService.post<unknown>(uri, {});
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<unknown>;
      } else {
        throw error;
      }
    }
  }
}