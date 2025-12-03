import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { IQueryListUser, IReqCreateUser, IReqUpdateUser, IUserResultData } from '../interface/user-management.interface';

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
      const uri = this.PREFIX_USER + `/admin/senderNames`;
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

  async getUserDetail(params: IQueryListUser): Promise<IBaseResponse<IUserResultData>> {
    try {
      const uri = this.PREFIX_USER + `/admin/senderNames`;
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

  async CreateUser(body: IReqCreateUser) {
    try {
      const uri = this.PREFIX_USER + '/auth/register';
      // const uri = this.PREFIX_USER + '/corps/users/createUser';
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
        credentialId: pwd
      }
      const url = this.PREFIX_USER + `/corps/users/${userId}/resetPassword`;
      const response = await this.httpService.post<any>(url, body);
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
      const url = this.PREFIX_USER + `/corps/users/${userId}/update`;
      const response = await this.httpService.post<any>(url, body);
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
      const uri = this.PREFIX_USER + `/corps/users/${userId}/delete`;
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