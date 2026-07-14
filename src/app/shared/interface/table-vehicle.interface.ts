export interface IVehicleResultData {
  keyword?: string;
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  vehicles: IVehicle[];
}

export interface IVehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  vin?: string;
  engineNumber?: string;
  color?: string;
  lastServiceDate?: string;
  status: VehicleStatus;
}

export type VehicleStatus = 'active' | 'in_service' | 'inactive';

export interface IQueryVehicle extends ISearchVehicle {
  page: number;
  limit: number;
  sort?: string;
}

export interface ISearchVehicle {
  keyword?: string;
  plateNumber?: string;
  ownerName?: string;
  brand?: string;
  model?: string;
  year?: number;
  status?: VehicleStatus;
}

export interface ITableHeaderVehicle {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}
