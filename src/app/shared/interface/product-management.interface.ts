import { IEngine, IVehicle } from "./catalog.interface";

export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateProduct {
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  categoryPath: string[];
  vehicles?: IVehicleCreate[];
  price: IPrices;
  spec: ISpec;
  images?: IImages[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

export interface IVehicleCreate {
  vehicleId: string;
  yearFrom: number;
  yearTo: number;
  engines: IEngine[];
  remark?: string;
}
export interface IReqUpdateProduct {
  name: string;
  description: string;
  categoryId?: string;
  brandId?: string;
  // vehicles?: IVehicle[];
  price: IPrices;
  spec: ISpec;
  images?: IImages[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}
export interface IImages {
  fileId: string;
  isPrimary: boolean;
  url?: string;
}

export interface ISpec {
  unit?: string;
  weight?: string;
  width?: string;
  height?: string;
  depth?: string;
}

export interface IPrices {
  retail?: number;
  wholesale?: number;
  cost?: number;
}



export interface IResponseProductDetail {
  product: IProductDetail;
  stockInfo?: IProductStock;
  recentMovements?: any[];
}

export interface IProductDetail {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  vehicles: IVehicle[];
  spec?: ISpec;
  images: IImages[];
  price?: IPrices;
  updatedDt: string;
  updatedBy: string;
  activeFlag: boolean;
}

export interface IProductStock {
   id: string;
    productId: string;
    sku: string;
    warehouseId?: string;
    quantity: number;
    reserved: number;
    available?: number;
    minStock: number;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    isDeleted?: boolean;
}

export interface IProductMovement {
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reference: string;
}