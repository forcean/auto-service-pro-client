import { EProductStatus, EReferenceType, EStockMovementDirection, EStockMovementType, EStockStatus } from "../enum/stock.enum";

export interface IStock {
  id: string;
  productId: string;
  sku: string;
  warehouseId?: string;
  warehouseName?: string;
  quantity: number;
  reserved: number;
  available: number;
  minStock: number;
  status: EStockStatus;
  createdDt: string;
  updatedDt: string;
}

export interface IStockProduct {
  id: string;
  sku: string;
  name: string;
  code: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  status: EProductStatus;
  stock: IStock;
}

export interface IStockMovement {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  movementType: EStockMovementType;
  direction: EStockMovementDirection;
  quantity: number;
  beforeQty: number;
  afterQty: number;
  referenceType?: EReferenceType;
  referenceId?: string;
  remark?: string;
  createdBy: string;
  createdAt: string;
}

export interface IStockMovementList {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IStockMovement[];
}

export interface IStockMovementSummary {
  total: number;
  receive: number;
  issue: number;
  adjust: number;
  return: number;
  reserve: number;
  release: number;
}

export interface ISearchStockMovement {
  keyword?: string;
  movementType?: EStockMovementType;
  direction?: EStockMovementDirection;
  productId?: string;
  warehouseId?: string;
  referenceType?: EReferenceType;
  referenceId?: string;
  createdBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface IQueryStockMovement extends ISearchStockMovement {
  page: number;
  limit: number;
  sort?: string;
}

export interface ICreateStockReceiveRequest{
  quantity: number;
  referenceType?: EReferenceType;
  referenceId?: string;
  remark?: string;
}