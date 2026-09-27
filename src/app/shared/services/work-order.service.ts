import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  IWorkOrder,
  IWorkOrderQuery,
  IWorkOrderResult,
  ICreateWorkOrderRequest,
  IUpdateWorkOrderRequest,
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

      return {
        ...response,
        resultData: {
          ...response.resultData,
          data: response.resultData.data.map((item) => this.mapWorkOrder(item)),
        },
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrderResult>;
      }

      throw error;
    }
  }

  async createWorkOrder(
    body: ICreateWorkOrderRequest,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const response = await this.httpService.post<IWorkOrder>(
        this.apiPath,
        body,
      );

      return { ...response, resultData: this.mapWorkOrder(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      }

      throw error;
    }
  }

  async updateWorkOrder(
    body: IUpdateWorkOrderRequest,
    workOrderNo: string,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const uri = this.apiPath + `/${workOrderNo}`;
      const response = await this.httpService.patch<IWorkOrder>(
        uri,
        body,
      );

      return { ...response, resultData: this.mapWorkOrder(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IWorkOrder>;
      }

      throw error;
    }
  }

  async updateWorkOrderStatus(
    workOrderNo: string,
    status: EWorkOrderStatus,
  ): Promise<IBaseResponse<IWorkOrder>> {
    try {
      const uri = `${this.apiPath}/${workOrderNo}/status`;

      const response = await this.httpService.patch<IWorkOrder>(uri, {
        status,
      });

      return { ...response, resultData: this.mapWorkOrder(response.resultData) };
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
      return { ...response, resultData: this.mapWorkOrder(response.resultData) };
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

  private mapWorkOrder(raw: any): IWorkOrder {
    const rawVehicle = raw.vehicle ?? raw.vehicleId;
    const vehicle = rawVehicle && typeof rawVehicle === 'object'
        ? {
          _id: this.toId(rawVehicle._id),
          firstname: rawVehicle.firstname,
          lastname: rawVehicle.lastname,
          phoneNumber: rawVehicle.phoneNumber,
          billingName: rawVehicle.billingName,
          licensePlate: rawVehicle.licensePlate,
          province: rawVehicle.province,
          vin: rawVehicle.vin,
          vehicle: rawVehicle.vehicle,
        }
      : undefined;

    // The Work Order API does not populate a separate `customer` relation.
    // Customer identity is stored on the populated customer-vehicle document.
    const customerSource =
      raw.customer && typeof raw.customer === 'object'
        ? raw.customer
        : rawVehicle && typeof rawVehicle === 'object'
          ? rawVehicle
          : undefined;
    const customer = customerSource
      ? {
          _id: this.toId(customerSource._id),
          name:
            customerSource.name ??
            [customerSource.firstname, customerSource.lastname]
              .filter(Boolean)
              .join(' '),
          phone: customerSource.phone ?? customerSource.phoneNumber ?? '',
          isVip: customerSource.isVip,
        }
      : undefined;

    const rawAdvisor = raw.advisor ?? raw.advisorId;
    const advisor = rawAdvisor && typeof rawAdvisor === 'object'
      ? {
          _id: this.toId(rawAdvisor._id),
          publicId: rawAdvisor.publicId,
          firstname: rawAdvisor.firstname,
          lastname: rawAdvisor.lastname,
          role: rawAdvisor.role,
        }
      : undefined;

    return {
      _id: this.toId(raw._id ?? raw.id) ?? '',
      workOrderNo: raw.workOrderNo ?? '',
      status: raw.status as EWorkOrderStatus,
      progress: Number(raw.progress ?? 0),
      taskSummary: raw.taskSummary,
      checkInDate: raw.checkInDate,
      expectedFinishDate: raw.expectedFinishDate,
      mileage: Number(raw.mileage ?? 0),
      fuelLevel: raw.fuelLevel,
      vehicle,
      vehicleId: this.toId(raw.vehicleId) || vehicle?._id || '',
      advisorId: this.toId(raw.advisorId ?? raw.advisor),
      advisor,
      currentQuotationId: this.toId(raw.currentQuotationId),
      invoiceId: this.toId(raw.invoiceId),
      customer,
      complaints: Array.isArray(raw.complaints) ? raw.complaints : [],
      inspectionRequired: Boolean(raw.inspectionRequired),
      inspections: Array.isArray(raw.inspections) ? raw.inspections : [],
      diagnosis: raw.diagnosis,
      images: Array.isArray(raw.images) ? raw.images : [],
      createdAt: raw.createdAt,
      customerRemark: raw.customerRemark,
      internalRemark: raw.internalRemark,
    };
  }

  private toId(value: unknown): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null && '_id' in value) {
      return String((value as { _id: unknown })._id);
    }
    return String(value);
  }
}
