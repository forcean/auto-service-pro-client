import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { IUserPermission } from '../interface/user.interface';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getMenu() {
    try {
      const uri = this.PREFIX_USER + '/menu';
      const response = await this.httpService.get<IResponseMenu>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return error.error as IBaseResponse<IResponseMenu>;
      } else {
        throw error;
      }
    }
  }

  async getUserPermission() {
    try {
      const uri = this.PREFIX_USER + `/users/permission`;
      const response = await this.httpService.get<IUserPermission>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IUserPermission>;
      } else {
        throw error;
      }
    }
  }
}