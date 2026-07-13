import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';

import { ApiPrefix } from '../enum/api-prefix.enum';

import { IBaseResponse } from '../interface/base-http.interface';

import {
  ICreateStockReceiveRequest,
  IQueryStockMovement,
  IStock,
  IStockMovementList,
  IStockMovementSummary,
} from '../interface/stock-management.interface';

@Injectable({
  providedIn: 'root',
})
export class StockManagementService {
  private readonly PREFIX = ApiPrefix.ServiceManagement;

  constructor(private readonly httpService: HttpService) {}

  async getStockList(
    params: IQueryStockMovement,
  ): Promise<IBaseResponse<IStockMovementList>> {
    try {
      const uri = `${this.PREFIX}/stock-management/stock-movements`;

      return await this.httpService.get<IStockMovementList>(uri, params);
    } catch (error) {
      return this.handleError<IStockMovementList>(error);
    }
  }

  async getStockDetail(productId: string): Promise<IBaseResponse<IStock>> {
    try {
      const uri = `${this.PREFIX}/stocks/${productId}`;

      return await this.httpService.get<IStock>(uri);
    } catch (error) {
      return this.handleError<IStock>(error);
    }
  }

  async getMovementHistory(
    productId: string,
  ): Promise<IBaseResponse<IStockMovementList>> {
    try {
      const uri = `${this.PREFIX}/stocks/${productId}/movements`;

      return await this.httpService.get<IStockMovementList>(uri);
    } catch (error) {
      return this.handleError<IStockMovementList>(error);
    }
  }

  async getMovementSummary(): Promise<IBaseResponse<IStockMovementSummary>> {
    try {
      const uri = `${this.PREFIX}/stock-management/stock-movements/summary`;

      return await this.httpService.get<IStockMovementSummary>(uri);
    } catch (error) {
      return this.handleError<IStockMovementSummary>(error);
    }
  }

  async createStockReceive(id: string, body:ICreateStockReceiveRequest): Promise<IBaseResponse<unknown>> {
    try {
      const uri = `${this.PREFIX}/stock-management/stocks/${id}/receive`;
      return await this.httpService.post<unknown>(uri,body);
    } catch (error) {
      return this.handleError<unknown>(error);
    }
  }

  private handleError<T>(error: unknown): IBaseResponse<T> {
    if (error instanceof HttpErrorResponse && error.error) {
      return error.error as IBaseResponse<T>;
    }

    throw error;
  }
}
