import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { IReqCreateUser, IReqUpdateUser, IResponseUserDetail } from '../interface/user-management.interface';
import { IQueryListUser, IUserResultData } from '../interface/table-user-management.interface';
import { IReqCreateProduct, IReqUpdateProduct, IResponseProductDetail } from '../interface/product-management.interface';
import { IProductList, IQueryListProduct } from '../interface/product-list.interface';

@Injectable({
  providedIn: 'root'
})
export class StockManagementService {

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getListProduct(params: IQueryListProduct): Promise<IBaseResponse<IProductList>> {
    try {
      const uri = this.PREFIX_USER + `/products`;
      const response = await this.httpService.get<IProductList>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IProductList>;
      } else {
        throw error;
      }
    }
  }

  async getProductDetail(productId: string | null): Promise<IBaseResponse<IResponseProductDetail>> {
    try {
      const uri = this.PREFIX_USER + `/products/${productId}/detail`;
      const response = await this.httpService.get<IResponseProductDetail>(uri);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResponseProductDetail>;
      } else {
        throw error;
      }
    }
  }

  async createProduct(body: IReqCreateProduct) {
    try {
      const uri = this.PREFIX_USER + '/products/create';
      const response = await this.httpService.post<any>(uri, body);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse) {
        return error.error as IBaseResponse<any>;
      } else {
        throw error;
      }
    }
  }

  async updateProduct(productId: string, body: IReqUpdateProduct) {
    try {
      const url = this.PREFIX_USER + `/products/${productId}/update`;
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
      const uri = this.PREFIX_USER + `/products/${userId}/delete`;
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