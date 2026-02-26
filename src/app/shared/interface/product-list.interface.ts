import { VehicleCompatibility } from "./vehicle.interface";

export interface IProductList {
  keyword?: string;
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  products: IProducts[];
}
export interface IProducts {
  id: string;
  name: string;
  code: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  vehicles: VehicleCompatibility[];
  spec?: ISpec;
  images: IImages[];
  prices?: IPrices;
  updatedDt: string;
  updatedBy: string;
  activeFlag: boolean;
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

export interface IQueryListProduct extends ISearchProducts {
  page: number;
  limit: number;
  sort?: string;
}
export interface ISearchProducts {
  keyword?: string;
  categoryId?: string
  brandId?: string
  vehicleBrandId?: string
  vehicleModelId?: string
  year?: string
  engine?: string
  inStock?: string
}

