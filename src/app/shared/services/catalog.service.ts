import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from './../../core/services/http-service/http.service';
import { Injectable } from '@angular/core';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import { ICategory } from '../interface/category.interface';
import { ProductBrand } from '../interface/brand.interface';
import { IQueryCatalogProducts, IQueryCatalogVehicles } from '../interface/catalog.interface';
import { VehicleCompatibility } from '../interface/vehicle.interface';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
  ) { }

  async getCategories(params: IQueryCatalogProducts): Promise<IBaseResponse<ICategory[]>> {
    try {
      const uri = this.PREFIX_USER + `/categories`;
      const response = await this.httpService.get<ICategory[]>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<ICategory[]>;
      } else {
        throw error;
      }
    }
  }

  async getBrands(params: IQueryCatalogProducts): Promise<IBaseResponse<ProductBrand[]>> {
    try {
      const uri = this.PREFIX_USER + `/brands`;
      const response = await this.httpService.get<ProductBrand[]>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<ProductBrand[]>;
      } else {
        throw error;
      }
    }
  }

  async getVehicles(params: IQueryCatalogVehicles): Promise<IBaseResponse<VehicleCompatibility[]>> {
    try {
      const uri = this.PREFIX_USER + `/vehicles`;
      const response = await this.httpService.get<VehicleCompatibility[]>(uri, params);
      return response;
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) {
        return error.error as IBaseResponse<VehicleCompatibility[]>;
      } else {
        throw error;
      }
    }
  }
}