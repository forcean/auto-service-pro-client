import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { IQueryCatalogProducts, IQueryCatalogVehicles, IResBrands, IResCategories, IResVehicles } from '../interface/catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getCategories(params: IQueryCatalogProducts): Promise<IBaseResponse<IResCategories>> {
    try {
      const uri = this.PREFIX_USER + `/products/categories`;
      const response = await this.httpService.get<IResCategories>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResCategories>;
      } else {
        throw error;
      }
    }
  }

  async getBrands(params: IQueryCatalogProducts): Promise<IBaseResponse<IResBrands>> {
    try {
      const uri = this.PREFIX_USER + `/products/brands`;
      const response = await this.httpService.get<IResBrands>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResBrands>;
      } else {
        throw error;
      }
    }
  }

  async getVehicles(params: IQueryCatalogVehicles): Promise<IBaseResponse<IResVehicles>> {
    try {
      const uri = this.PREFIX_USER + `/products/vehicles`;
      const response = await this.httpService.get<IResVehicles>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<IResVehicles>;
      } else {
        throw error;
      }
    }
  }
}