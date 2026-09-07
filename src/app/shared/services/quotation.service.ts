import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { EWorkOrderStatus } from '../enum/work-order.enum';
import { IQueryListQuotation, IQuotationResultData } from '../interface/table-quotation.interface';
import { IQuotationListItem } from '../interface/quotation.interface';

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

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationResultData>;
      }

      throw error;
    }
  }

  async createQuotation(body: unknown): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const response = await this.httpService.post<IQuotationListItem>(
        this.apiPath,
        body,
      );

      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationListItem>;
      }

      throw error;
    }
  }

  async updateQuotation(
    body: unknown,
    workOrderNo: string,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const uri = this.apiPath + `/${workOrderNo}`;
      const response = await this.httpService.patch<IQuotationListItem>(
        uri,
        body,
      );

      return response;
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
    workOrderNo: string,
  ): Promise<IBaseResponse<IQuotationListItem>> {
    try {
      const uri = this.apiPath + `/${workOrderNo}`;
      const response = await this.httpService.get<IQuotationListItem>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IQuotationListItem>;
      } else {
        throw error;
      }
    }
  }

  async deleteQuotation(id: string) {
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
