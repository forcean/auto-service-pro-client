export enum EQuotationItemType {
  PART = 'PART',
  LABOR = 'LABOR',
  SERVICE = 'SERVICE',
}

export enum EQuotationStatus {
  DRAFT = 'DRAFT',
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
  status?: EQuotationStatus;
  approvedBy?: string;
  approvedAt?: string;
  remark?: string;
}

export interface IQuotationListItem {
  _id: string;
  quotationNo: string;

  workOrderId: string;
  workOrderNo: string;

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

  createdBy: string;
  updatedBy?: string;

  isDeleted: boolean;

  approvalHistory: IQuotationApprovalHistory[];

  createdAt: string;
  updatedAt: string;

  __v: number;
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

export interface ICreateQuotationRequest {
  workOrderId: string;
  validUntil?: string;
  includeVat: boolean;
  taxPercent: number;
  discountAmount: number;
  customerRemark?: string;
  internalRemark?: string;
  items: IQuotationItemFormValue[];
}

export interface IUpdateQuotationRequest {
  workOrderId: string;
  validUntil?: string;
  includeVat: boolean;
  taxPercent: number;
  discountAmount: number;
  customerRemark?: string;
  internalRemark?: string;
  items: IQuotationItemFormValue[];
}