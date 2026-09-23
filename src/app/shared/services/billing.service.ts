import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpService } from '../../core/services/http-service/http.service';
import { ApiPrefix } from '../enum/api-prefix.enum';
import { IBaseResponse } from '../interface/base-http.interface';
import {
  ICreatePaymentRequest,
  ICreateWorkOrderPaymentRequest,
  IInvoice,
  IInvoiceListResult,
  IReadyToInvoiceWorkOrder,
  IWorkOrderPayment,
} from '../interface/billing.interface';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly apiPath = `${ApiPrefix.ServiceManagement}/billing/invoices`;

  constructor(private readonly httpService: HttpService) {}

  async getInvoices(params: { page?: number; limit?: number; status?: string; keyword?: string } = {}): Promise<IBaseResponse<IInvoiceListResult>> {
    return this.request(() => this.httpService.get<IInvoiceListResult>(this.apiPath, params), (result) => ({
      ...result,
      data: (result.data ?? []).map((item) => this.mapInvoice(item)),
    }));
  }

  async getReadyWorkOrders(): Promise<IBaseResponse<IReadyToInvoiceWorkOrder[]>> {
    return this.request(() => this.httpService.get<IReadyToInvoiceWorkOrder[]>(`${this.apiPath}/ready-work-orders`), (result) =>
      (result ?? []).map((item) => this.mapReadyWorkOrder(item)),
    );
  }

  async createInvoice(workOrderId: string): Promise<IBaseResponse<IInvoice>> {
    return this.request(
      () => this.httpService.post<IInvoice>(`${this.apiPath}/from-work-order/${workOrderId}`, {}),
      (result) => this.mapInvoice(result),
    );
  }

  async getInvoice(invoiceId: string): Promise<IBaseResponse<IInvoice>> {
    return this.request(() => this.httpService.get<IInvoice>(`${this.apiPath}/${invoiceId}`), (result) => this.mapInvoice(result));
  }

  async receivePayment(invoiceId: string, body: ICreatePaymentRequest): Promise<IBaseResponse<IInvoice>> {
    return this.request(
      () => this.httpService.post<IInvoice>(`${this.apiPath}/${invoiceId}/payments`, body),
      (result) => this.mapInvoice(result),
    );
  }

  async getWorkOrderPayments(workOrderNo: string): Promise<IBaseResponse<IWorkOrderPayment[]>> {
    return this.request(
      () => this.httpService.get<IWorkOrderPayment[]>(`${this.apiPath}/work-orders/${workOrderNo}/prepayments`),
      (result) => (result ?? []).map((item) => this.mapWorkOrderPayment(item)),
    );
  }

  async recordWorkOrderPayment(
    workOrderNo: string,
    body: ICreateWorkOrderPaymentRequest,
  ): Promise<IBaseResponse<IWorkOrderPayment>> {
    return this.request(
      () => this.httpService.post<IWorkOrderPayment>(`${this.apiPath}/work-orders/${workOrderNo}/prepayments`, body),
      (result) => this.mapWorkOrderPayment(result),
    );
  }

  getPrintableInvoice(invoiceId: string): Promise<string> {
    return this.httpService.getText(`${this.apiPath}/${invoiceId}/print`);
  }

  private async request<T, R>(call: () => Promise<IBaseResponse<T>>, map: (result: T) => R): Promise<IBaseResponse<R>> {
    try {
      const response = await call();
      return { ...response, resultData: map(response.resultData) };
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error) return error.error as IBaseResponse<R>;
      throw error;
    }
  }

  private mapInvoice(raw: any): IInvoice {
    return {
      _id: this.toId(raw?._id ?? raw?.id),
      invoiceNo: raw?.invoiceNo ?? '',
      workOrderId: this.toId(raw?.workOrderId),
      quotationId: this.toId(raw?.quotationId),
      workOrderNo: raw?.workOrderNo ?? '',
      status: raw?.status,
      billingParty: raw?.billingParty,
      vehicleSnapshot: raw?.vehicleSnapshot,
      items: (raw?.items ?? []).map((item: any) => ({
        ...item,
        productId: this.toId(item.productId),
        quantity: Number(item.quantity ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
        discountAmount: Number(item.discountAmount ?? 0),
        totalAmount: Number(item.totalAmount ?? 0),
      })),
      partTotal: Number(raw?.partTotal ?? 0),
      laborTotal: Number(raw?.laborTotal ?? 0),
      serviceTotal: Number(raw?.serviceTotal ?? 0),
      discountAmount: Number(raw?.discountAmount ?? 0),
      vatAmount: Number(raw?.vatAmount ?? 0),
      grandTotal: Number(raw?.grandTotal ?? 0),
      paidAmount: Number(raw?.paidAmount ?? 0),
      prepaymentAppliedAmount: Number(raw?.prepaymentAppliedAmount ?? 0),
      appliedPrepayments: (raw?.appliedPrepayments ?? []).map((payment: any) => ({
        paymentNo: payment.paymentNo ?? '',
        type: payment.type,
        amount: Number(payment.amount ?? 0),
      })),
      payments: (raw?.payments ?? []).map((payment: any) => ({ ...payment, amount: Number(payment.amount ?? 0) })),
      createdAt: raw?.createdAt,
    };
  }

  private mapReadyWorkOrder(raw: any): IReadyToInvoiceWorkOrder {
    return {
      _id: this.toId(raw?._id ?? raw?.id),
      workOrderNo: raw?.workOrderNo ?? '',
      status: raw?.status ?? '',
      mileage: Number(raw?.mileage ?? 0),
      vehicle: raw?.vehicle ?? raw?.vehicleId,
      canCreateInvoice: Boolean(raw?.canCreateInvoice),
      blockers: Array.isArray(raw?.blockers) ? raw.blockers : [],
    };
  }

  private mapWorkOrderPayment(raw: any): IWorkOrderPayment {
    return {
      _id: this.toId(raw?._id ?? raw?.id),
      paymentNo: raw?.paymentNo ?? '',
      workOrderId: this.toId(raw?.workOrderId),
      workOrderNo: raw?.workOrderNo ?? '',
      type: raw?.type,
      amount: Number(raw?.amount ?? 0),
      allocatedAmount: Number(raw?.allocatedAmount ?? 0),
      method: raw?.method,
      reference: raw?.reference,
      note: raw?.note,
      receivedBy: raw?.receivedBy ?? '',
      paidAt: raw?.paidAt,
    };
  }

  private toId(value: unknown): string {
    if (!value) return '';
    if (typeof value === 'object' && value !== null && '_id' in value) return String((value as { _id: unknown })._id);
    return String(value);
  }
}
