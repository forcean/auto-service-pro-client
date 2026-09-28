import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IResponseMenu } from '../interface/sidebar.interface';
import { IBaseResponse } from '../interface/base-http.interface';
import { IReqCreateUser, IReqUpdateUser, IResponseUserDetail } from '../interface/user-management.interface';
import { IQueryListUser, IUserResultData } from '../interface/table-user-management.interface';
import { IReqCreateProduct, IReqUpdateProduct, IResponseProductDetail } from '../interface/product-management.interface';
import {
  IProductList,
  IProducts,
  IQueryListProduct,
} from '../interface/product-list.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getListProduct(params: IQueryListProduct): Promise<IBaseResponse<IProductList>> {
    try {
      const uri = this.PREFIX_USER + `/products/listProducts`;
      const response = await this.httpService.get<IProductList>(uri, params);
      const resultData = response.resultData ?? ({} as IProductList);
      const total = Number(resultData.total ?? response.total ?? 0);
      const limit = Number(resultData.limit ?? params.limit);

      return {
        ...response,
        resultData: {
          ...resultData,
          page: Number(resultData.page ?? params.page),
          limit,
          total,
          totalPage:
            Number(resultData.totalPage ?? 0) ||
            (limit > 0 ? Math.ceil(total / limit) : 0),
          products: (resultData.products ?? []).map((product) =>
            this.mapProduct(product),
          ),
        },
      };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IProductList>;
      } else {
        throw error;
      }
    }
  }

  private mapProduct(raw: any): IProducts {
    raw = raw ?? {};
    const sku = raw.sku ?? raw.code ?? '';
    const price = raw.price ?? raw.prices;
    const media = raw.media ?? raw.images ?? [];

    return {
      ...raw,
      id: String(raw.id ?? raw._id ?? ''),
      sku,
      code: sku,
      images: Array.isArray(media) ? media : [],
      prices: price,
    } as IProducts;
  }

  async getProductDetail(productId: string | null): Promise<IBaseResponse<IResponseProductDetail>> {
    try {
      const uri = this.PREFIX_USER + `/products/${productId}/detail`;
      const response = await this.httpService.get<IResponseProductDetail>(uri);

      if (!response.resultData?.product) {
        return response;
      }

      return {
        ...response,
        resultData: {
          ...response.resultData,
          // The product schema stores these fields as `media` and `price`.
          // Keep the detail response consistent with the product-list contract.
          product: this.mapProduct(response.resultData.product) as IResponseProductDetail['product'],
        },
      };
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
      const uri = this.PREFIX_USER + '/products';
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

  async deleteProduct(sku: string) {
    try {
      const uri = this.PREFIX_USER + `/products/${sku}/delete`;
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
