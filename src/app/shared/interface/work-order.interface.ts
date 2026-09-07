import { EFuelLevel } from '../components/create-work-order-modal/create-work-order-modal.component';
import { EWorkOrderStatus } from '../enum/work-order.enum';

export interface IWorkOrderVehicle2 {
  _id?: string;
  licensePlate: string;
  province: string;
  vehicle: {
    model: string;
    brand: string;
    generation: string;
  };
  vin: string;
}

export interface IWorkOrderCustomer {
  _id?: string;
  name: string;
  phone: string;
  isVip?: boolean;
}

export interface IComplaint {
  title: string;
  description: string;
  completed: boolean;
}

export interface IInspection {
  item: string;
  status: string;
  remark: boolean;
}

export interface IWorkOrder {
  _id: string;
  workOrderNo: string;
  status: EWorkOrderStatus;
  progress: number;
  expectedFinishDate?: string;
  mileage?: number;
  fuelLevel?: EFuelLevel;
  vehicle: IWorkOrderVehicle2;
  vehicleId: string;
  customer: IWorkOrderCustomer;
  complaints: IComplaint[];
  inspections: IInspection[];
  createdAt: string;
  customerRemark: string;
  internalRemark: string;
}

export interface IWorkOrderQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EWorkOrderStatus;
  date?: string;
}

export interface IWorkOrderResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IWorkOrder[];
}
