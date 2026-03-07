import { IVehicle } from "./catalog.interface";

export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateProduct {
  name: string;
  description: string;
  categoryId?: string;
  brandId?: string;
  vehicles?: IVehicle[];
  price: IPrices;
  spec: ISpec;
  images?: IImages[];
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}
export interface IReqUpdateProduct {
  name: string;
  description: string;
  categoryId?: string;
  brandId?: string;
  vehicles?: IVehicle[];
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
  code: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  vehicles: IVehicle[];
  spec?: ISpec;
  images: IImages[];
  prices?: IPrices;
  updatedDt: string;
  updatedBy: string;
  activeFlag: boolean;
}

export interface IProductStock {
  onHand: number;
  reserved: number;
  available: number;
  minStock: number;
}

export interface IProductMovement {
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reference: string;
}