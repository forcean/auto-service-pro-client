import { VehicleCompatibility } from "./vehicle.interface";

export type DataType = 'string' | 'number' | 'percent' | 'date';

export interface IReqCreateProduct {
    name: string;
    description: string;
    categoryId?: string;
    brandId?: string;
    vehicle?: VehicleCompatibility[];
    prices: IPrices;
    spec: ISpec;
    images?: IImages[];
    status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}
export interface IImages {
    fileId: string;
    isPrimary: boolean;
}

export interface ISpec {
    unit?: string;
    weight?: number;
    width?: number;
    height?: number;
    depth?: number;
}

export interface IPrices {
    type: 'RETAIL' | 'WHOLESALE' | 'COST';
    amount: number;
}

export interface IReqUpdateProduct {
    name: string;
    description: string;
    categoryId?: string;
    brandId?: string;
    vehicle?: VehicleCompatibility[];
    prices: IPrices;
    spec: ISpec;
    images?: IImages[];
    status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

export interface IResponseProductDetail {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    brandId: string;
    status: string;
    vehicles?: string;
    spec?: string;
    images: string;
    prices: [];
    updatedDt: string;
    updatedBy: string;
    activeFlag: boolean;
}