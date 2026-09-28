export enum EInvoiceStatus {
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOID = 'VOID',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
}

export enum EPaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  QR = 'QR',
  OTHER = 'OTHER',
}

export type TReceiptPrintSize = 'a4' | '80mm' | '58mm';
export type TCashFlowInterval = 'day' | 'week' | 'month';

export interface IInvoiceItem {
  itemType: 'PART' | 'LABOR' | 'SERVICE';
  productId?: string;
  sku?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalAmount: number;
  sourcePartIssueNo?: string;
}

export interface IPaymentRecord {
  paymentNo: string;
  amount: number;
  method: EPaymentMethod;
  reference?: string;
  note?: string;
  paidAt?: string;
}

export enum EWorkOrderPaymentType {
  DEPOSIT = 'DEPOSIT',
  PROGRESS = 'PROGRESS',
}

export interface IWorkOrderPayment {
  _id: string;
  paymentNo: string;
  workOrderId: string;
  workOrderNo: string;
  type: EWorkOrderPaymentType;
  amount: number;
  allocatedAmount: number;
  method: EPaymentMethod;
  reference?: string;
  note?: string;
  receivedBy: string;
  paidAt?: string;
}

export interface IInvoice {
  _id: string;
  invoiceNo: string;
  workOrderId: string;
  quotationId: string;
  workOrderNo: string;
  status: EInvoiceStatus;
  billingParty?: { name?: string; phone?: string; taxId?: string; address?: string; branchNo?: string };
  vehicleSnapshot?: { licensePlate?: string; province?: string; brand?: string; model?: string };
  items: IInvoiceItem[];
  partTotal: number;
  laborTotal: number;
  serviceTotal: number;
  discountAmount: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  prepaymentAppliedAmount: number;
  appliedPrepayments: Array<{ paymentNo: string; type: EWorkOrderPaymentType; amount: number }>;
  payments: IPaymentRecord[];
  createdAt?: string;
}

export interface IInvoiceListResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IInvoice[];
}

export interface IReadyToInvoiceWorkOrder {
  _id: string;
  workOrderNo: string;
  status: 'READY_DELIVERY' | 'COMPLETED' | string;
  mileage: number;
  vehicle?: {
    licensePlate?: string;
    province?: string;
    firstname?: string;
    lastname?: string;
    vehicle?: { brand?: string; model?: string };
  };
  canCreateInvoice: boolean;
  blockers: string[];
}

export interface ICreatePaymentRequest {
  amount: number;
  method: EPaymentMethod;
  reference?: string;
  note?: string;
}

export interface ICreateWorkOrderPaymentRequest extends ICreatePaymentRequest {
  type: EWorkOrderPaymentType;
}

export interface IPaymentTransaction {
  invoiceId: string;
  invoiceNo: string;
  workOrderNo: string;
  billingParty?: IInvoice['billingParty'];
  vehicleSnapshot?: IInvoice['vehicleSnapshot'];
  paymentNo: string;
  amount: number;
  method: EPaymentMethod;
  reference?: string;
  note?: string;
  paidAt?: string;
  receivedBy?: string;
}

export interface IPaymentListResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: IPaymentTransaction[];
}

export interface IPaymentCashFlowPeriod {
  period: string;
  amount: number;
  transactions: number;
}

export interface IPaymentMethodSummary {
  method: EPaymentMethod;
  amount: number;
  transactions: number;
}

export interface IPaymentCashFlowSummary {
  interval: TCashFlowInterval;
  totalAmount: number;
  totalTransactions: number;
  averagePeriodAmount: number;
  latestPaymentAt?: string;
  series: IPaymentCashFlowPeriod[];
  byMethod: IPaymentMethodSummary[];
}

export interface IPaymentQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  method?: EPaymentMethod;
  paidFrom?: string;
  paidTo?: string;
  chartInterval?: TCashFlowInterval;
}
