import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  IWorkOrder,
  IWorkOrderQuery,
  IWorkOrderResult,
} from '../interface/work-order.interface';
import { EWorkOrderStatus } from '../enum/work-order.enum';

@Injectable({
  providedIn: 'root',
})
export class WorkOrderService {
  private readonly PREFIX = ApiPrefix.ServiceManagement;
  private readonly apiPath = this.PREFIX + '/work-order';

  constructor(private httpService: HttpService) {}

  async getListWorkOrder(
    params: IWorkOrderQuery,
  ): Promise<IBaseResponse<IWorkOrderResult>> {
    try {
      const response = await this.httpService.get<IWorkOrderResult>(
        this.apiPath,
        params,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrderResult>;
      }

      throw error;
    }
  }

  async createWorkOrder(body: unknown): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const response = await this.httpService.post<IWorkOrder>(
        this.apiPath,
        body,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      }

      throw error;
    }
  }

  async updateWorkOrder(
    body: unknown,
    workOrderNo: string,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const uri = this.apiPath + `/${workOrderNo}`;
      const response = await this.httpService.patch<IWorkOrder>(
        uri,
        body,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      }

      throw error;
    }
  }

  async updateWorkOrderStatus(
    workOrderId: string,
    status: EWorkOrderStatus,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const uri = `${this.apiPath}/${workOrderId}/status`;

      const response = await this.httpService.patch<IWorkOrder>(uri, {
        status,
      });

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      }

      throw error;
    }
  }

  async getWorkOrderDetail(
    workOrderNo: string,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const uri = this.apiPath + `/${workOrderNo}`;
      const response = await this.httpService.get<IWorkOrder>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      } else {
        throw error;
      }
    }
  }

  async deleteWorkOrder(id: string) {
    try {
      const uri = this.apiPath + `/${id}/delete`;
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
