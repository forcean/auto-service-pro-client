import { EVehicleStatus } from "../enum/vehicle.enum";
import { IVehicle } from "./catalog.interface";

export interface IVehicleResultData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  vehicles: ICustomerVehicle[];
}

export interface ICustomerVehicle {
  _id: string;
  firstname: string;
  lastname: string;      
  phoneNumber: string;
  licensePlate: string;
  province: string;      
  vehicle: IVehicle; 
  status: EVehicleStatus;
  registrationDt: string;
  createdBy: string;
  updatedBy?: string;    
  updatedDt?: string;    
  // _id: string;
  // plateNumber: string;
  // ownerName: string;
  // brand: string;
  // model: string;
  // year: number;
  // mileage: number;
  // vin?: string;
  // engineNumber?: string;
  // color?: string;
  lastServiceDate?: string;
  // status: EVehicleStatus;
}
export interface IQueryVehicle extends ISearchVehicle {
  page: number;
  limit: number;
  sort?: string;
}

export interface ISearchVehicle {
  licensePlate?: string;
  province?: string;
  plateNumber?: string;
  ownerName?: string;
  brand?: string;
  model?: string;
  year?: number;
  status?: EVehicleStatus;
}

export interface ITableHeaderVehicle {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}

export interface IVehicleKey {
  licensePlate: string;
  province: string;
}
