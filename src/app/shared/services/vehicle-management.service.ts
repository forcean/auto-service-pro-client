import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  IReqCreateUser,
  IReqUpdateUser,
  IResponseUserDetail,
} from '../interface/user-management.interface';
import {
  IQueryListUser,
  IUserResultData,
} from '../interface/table-user-management.interface';
import {
  IQueryVehicle,
  IVehicleResultData,
} from '../interface/table-vehicle.interface';

@Injectable({
  providedIn: 'root',
})
export class VehicleManagementService {
  private readonly PREFIX_USER = ApiPrefix.ServiceManagement;
  private readonly apiPath = this.PREFIX_USER + `/vehicles/customer`;

  constructor(private httpService: HttpService) {}

  async getListVehicle(
    params: IQueryVehicle,
  ): Promise<IBaseResponse<IVehicleResultData>> {
    try {
      const uri = this.apiPath;
      const response = await this.httpService.get<IVehicleResultData>(
        uri,
        params,
      );
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IVehicleResultData>;
      } else {
        throw error;
      }
    }
  }

  async getVehicleDetail(
    licensePlate: string,
    province: string,
  ): Promise<IBaseResponse<unknown>> {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}/detail`;
      const response = await this.httpService.get<unknown>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<unknown>;
      } else {
        throw error;
      }
    }
  }

  async CreateCustomerVehicle(body: unknown) {
    try {
      const uri = this.apiPath;
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
        painTextPassword: pwd,
      };
      const url = this.PREFIX_USER + `/users/corps/${userId}/resetPassword`;
      // const url = this.PREFIX_USER + `/users/${userId}/resetPassword`;
      const response = await this.httpService.patch<any>(url, body);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async updateCustomerVehicleDetail(
    body: any,
    licensePlate: string,
    province: string,
  ) {
    try {
      const url = this.apiPath + `/${licensePlate}/${province}`;
      const response = await this.httpService.patch<any>(url, body);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async deleteCustomerVehicle(licensePlate: string, province: string) {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}`;
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
