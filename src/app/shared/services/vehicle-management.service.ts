import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  ICustomerVehicle,
  IQueryVehicle,
  IVehicleResultData,
} from '../interface/table-vehicle.interface';
import { IServiceHistoryResultData } from '../interface/table-vehicle-service-history.interface';
import { IVehicleOverviewState } from '../interface/customer-vehicle-management.interface';
import { IWorkOrderItem } from '../components/vehicle-work-orders/vehicle-work-orders.component';

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
  ): Promise<IBaseResponse<ICustomerVehicle>> {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}/detail`;
      const response = await this.httpService.get<ICustomerVehicle>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<ICustomerVehicle>;
      } else {
        throw error;
      }
    }
  }

  async getVehicleOverview(
    licensePlate: string,
    province: string,
  ): Promise<IBaseResponse<IVehicleOverviewState>> {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}/overview`;
      const response = await this.httpService.get<IVehicleOverviewState>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IVehicleOverviewState>;
      } else {
        throw error;
      }
    }
  }

  async getVehicleServices(
    licensePlate: string,
    province: string,
  ): Promise<IBaseResponse<IServiceHistoryResultData>> {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}/services`;
      const response = await this.httpService.get<IServiceHistoryResultData>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IServiceHistoryResultData>;
      } else {
        throw error;
      }
    }
  }

  async getVehicleWorkOrders(
    licensePlate: string,
    province: string,
  ): Promise<IBaseResponse<IWorkOrderItem[]>> {
    try {
      const uri = this.apiPath + `/${licensePlate}/${province}/workOrders`;
      const response = await this.httpService.get<IWorkOrderItem[]>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrderItem[]>;
      } else {
        throw error;
      }
    }
  }

  async createCustomerVehicle(body: unknown) {
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
      const uri = this.apiPath + `/${licensePlate}/${province}/delete`;
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
