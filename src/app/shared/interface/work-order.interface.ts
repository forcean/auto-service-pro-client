import { EFuelLevel } from '../components/create-work-order-modal/create-work-order-modal.component';
import { EWorkOrderStatus } from '../enum/work-order.enum';

export interface IWorkOrderVehicle2 {
  _id?: string;
  licensePlate?: string;
  province?: string;
  vehicle?: {
    model?: string;
    brand?: string;
    generation?: string;
  };
  vin?: string;
}

export interface IWorkOrderCustomer {
  _id?: string;
  name: string;
  phone: string;
  isVip?: boolean;
}

export interface IWorkOrderAdvisor {
  _id?: string;
  publicId?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
}

export interface IComplaint {
  title: string;
  description?: string;
}

export interface IInspection {
  item: string;
  status: 'GOOD' | 'WARNING' | 'BAD';
  remark?: string;
}

export interface IWorkOrderTaskSummary {
  totalTasks: number;
  completedTasks: number;
  cancelledTasks: number;
}

export interface ICreateWorkOrderRequest {
  vehicleId: string;
  mileage: number;
  fuelLevel?: EFuelLevel;
  complaints: IComplaint[];
  inspectionRequired?: boolean;
  inspections?: IInspection[];
  diagnosis?: string;
  customerRemark?: string;
  internalRemark?: string;
  images?: string[];
  expectedFinishDate?: string;
  advisor?: string;
}

export type IUpdateWorkOrderRequest = Partial<ICreateWorkOrderRequest>;

export interface IWorkOrder {
  _id: string;
  workOrderNo: string;
  status: EWorkOrderStatus;
  progress: number;
  taskSummary?: IWorkOrderTaskSummary;
  checkInDate?: string;
  expectedFinishDate?: string;
  mileage: number;
  fuelLevel?: EFuelLevel;
  vehicle?: IWorkOrderVehicle2;
  vehicleId: string;
  customerId?: string;
  advisorId?: string;
  advisor?: IWorkOrderAdvisor;
  currentQuotationId?: string;
  customer?: IWorkOrderCustomer;
  complaints: IComplaint[];
  inspectionRequired: boolean;
  inspections: IInspection[];
  diagnosis?: string;
  images: string[];
  createdAt?: string;
  customerRemark?: string;
  internalRemark?: string;
}

export interface IWorkOrderQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IWorkOrderResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IWorkOrder[];
}
