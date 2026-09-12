import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { RESPONSE } from '../enum/response.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { IQueryListQuotation, IQuotationResultData } from '../interface/table-quotation.interface';
import {
  IApproveQuotationRequest,
  ICreateQuotationRequest,
  IQuotationListItem,
  IUpdateQuotationRequest,
} from '../interface/quotation.interface';

@Injectable({
  providedIn: 'root',
})
export class QuotationService {
  private readonly PREFIX = ApiPrefix.ServiceManagement;
  private readonly apiPath = this.PREFIX + '/quotation';

  constructor(private httpService: HttpService) {}

  async getListQuotation(
    params: IQueryListQuotation,
  ): Promise<IBaseResponse<IQuotationResultData>> {
    try {
      const response = await this.httpService.get<IQuotationResultData>(
        this.apiPath,
        params,
      );

      return {
        ...response,
        resultData: {
          ...response.resultData,
          data: response.resultData.data.map((item) => this.mapQuotation(item)),
        },
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationResultData>;
      }

      throw error;
    }
  }

  async createQuotation(
    body: ICreateQuotationRequest,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const response = await this.httpService.post<IQuotationListItem>(
        this.apiPath,
        body,
      );

      return { ...response, resultData: this.mapQuotation(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationListItem>;
      }

      throw error;
    }
  }

  async updateQuotation(
    body: IUpdateQuotationRequest,
    quotationNo: string,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const uri = this.apiPath + `/${quotationNo}`;
      const response = await this.httpService.patch<IQuotationListItem>(
        uri,
        body,
      );

      return { ...response, resultData: this.mapQuotation(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationListItem>;
      }

      throw error;
    }
  }

  // async updateQuotationStatus(
  //   workOrderId: string,
  //   status: EWorkOrderStatus,
  // ): Promise<IBaseResponse<IWorkOrder>> {
  //   try {
  //     const uri = `${this.apiPath}/${workOrderId}/status`;

  //     const response = await this.httpService.patch<IWorkOrder>(uri, {
  //       status,
  //     });

  //     return response;
  //   } catch (error) {
  //     if (error instanceof HttpErrorResponse && error.error) {
  //       return error.error as IBaseResponse<IWorkOrder>;
  //     }

  //     throw error;
  //   }
  // }

  async getQuotationDetail(
    quotationNo: string,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const uri = this.apiPath + `/${quotationNo}`;
      const response = await this.httpService.get<IQuotationListItem>(uri);
      return { ...response, resultData: this.mapQuotation(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationListItem>;
      } else {
        throw error;
      }
    }
  }

  /**
   * The current repository implementation resolves this route by Mongo id,
   * despite the controller parameter being named quotationNo.
   */
  async deleteQuotation(quotationId: string) {
    try {
      const uri = this.apiPath + `/${quotationId}/delete`;
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

  async approveQuotation(
    quotationNo: string,
    body: IApproveQuotationRequest,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    const response = await this.request(() =>
      this.httpService.patch<IQuotationListItem>(`${this.apiPath}/${quotationNo}/approve`, body),
    );

    return response.resultCode === RESPONSE.SUCCESS
      ? { ...response, resultData: this.mapQuotation(response.resultData) }
      : response;
  }

  async rejectQuotation(
    quotationNo: string,
    reason: string,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    return this.request(() =>
      this.httpService.patch<IQuotationListItem>(`${this.apiPath}/${quotationNo}/reject`, { reason }),
    );
  }

  async createRevision(quotationNo: string): Promise<IBaseResponse<IQuotationListItem>> {
    return this.request(() =>
      this.httpService.post<IQuotationListItem>(`${this.apiPath}/${quotationNo}/revision`, {}),
    );
  }

  private async request<T>(action: () => Promise<IBaseResponse<T>>): Promise<IBaseResponse<T>> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<T>;
      }
      throw error;
    }
  }

  private mapQuotation(raw: any): IQuotationListItem {
    const workOrder = raw.workOrder ?? raw.workOrderId;
    const workOrderId = this.toId(raw.workOrderId) ?? this.toId(workOrder?.id) ?? '';
    const workOrderNo = raw.workOrderNo ?? workOrder?.workOrderNo ?? '';

    return {
      ...raw,
      _id: this.toId(raw._id ?? raw.id) ?? '',
      id: this.toId(raw.id ?? raw._id) ?? '',
      workOrderId,
      workOrderNo,
      workOrder: workOrder && typeof workOrder === 'object'
        ? {
            id: this.toId(workOrder.id ?? workOrder._id) ?? workOrderId,
            workOrderNo,
            vehicleId: this.toId(workOrder.vehicleId) ?? '',
            customerId: this.toId(workOrder.customerId) ?? '',
            advisorId: this.toId(workOrder.advisorId),
            status: workOrder.status ?? '',
          }
        : undefined,
      approvalHistory: Array.isArray(raw.approvalHistory) ? raw.approvalHistory : [],
      items: Array.isArray(raw.items) ? raw.items : [],
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
