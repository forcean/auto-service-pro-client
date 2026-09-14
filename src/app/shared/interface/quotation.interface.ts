export enum EQuotationItemType {
  PART = 'PART',
  LABOR = 'LABOR',
  SERVICE = 'SERVICE',
}

export enum EQuotationStatus {
  DRAFT = 'DRAFT',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface IQuotationItem {
  itemType: EQuotationItemType;
  productId?: string;
  sku?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  remark?: string;
}

export interface IQuotationApprovalHistory {
  decision: 'APPROVED' | 'PARTIAL' | 'REJECTED';
  customerName: string;
  method: 'PHONE' | 'LINE' | 'FACEBOOK' | 'IN_PERSON';
  approvedBy: string;
  approvedAt: string;
  note?: string;
}

export interface IQuotationWorkOrder {
  id: string;
  workOrderNo: string;
  vehicleId: string;
  customerId: string;
  advisorId?: string;
  status: string;
}

export interface IQuotationListItem {
  _id: string;
  id: string;
  quotationNo: string;

  workOrderId: string;
  workOrderNo: string;
  workOrder?: IQuotationWorkOrder;

  status: EQuotationStatus;

  version: number;
  isLatest: boolean;

  partTotal: number;
  laborTotal: number;
  serviceTotal: number;

  grandTotal: number;

  validUntil?: string;

  customerRemark?: string;
  internalRemark?: string;

  includeVat: boolean;
  taxPercent: number;

  discountAmount: number;
  vatAmount: number;

  items: IQuotationItem[];

  createdBy?: string;
  updatedBy?: string;

  isDeleted: boolean;

  approvalHistory: IQuotationApprovalHistory[];

  createdAt: string;
  updatedAt: string;

  __v?: number;
}

export interface IQuotationItemFormValue {
  itemType: EQuotationItemType;
  productId?: string;
  sku?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  remark?: string;
}

/** Exact DTO accepted by CreateQuotationDto / UpdateQuotationDto. */
export type IQuotationItemRequest =
  | {
      itemType: EQuotationItemType.PART;
      productId: string;
      sku: string;
      quantity: number;
      discountAmount?: number;
      remark?: string;
    }
  | {
      itemType: EQuotationItemType.LABOR | EQuotationItemType.SERVICE;
      description: string;
      quantity: number;
      unitPrice: number;
      discountAmount?: number;
      remark?: string;
    };

export interface ICreateQuotationRequest {
  workOrderId: string;
  validUntil?: string;
  includeVat?: boolean;
  taxPercent?: number;
  discountAmount?: number;
  customerRemark?: string;
  internalRemark?: string;
  items: IQuotationItemRequest[];
}

export type IUpdateQuotationRequest = ICreateQuotationRequest;

export interface IApproveQuotationRequest {
  method: 'PHONE' | 'LINE' | 'FACEBOOK' | 'IN_PERSON';
  customerName: string;
  note?: string;
}
