import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FileText,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  WalletCards,
} from 'lucide-angular';
import { Subscription } from 'rxjs';

import { RESPONSE } from '../../../shared/enum/response.enum';
import {
  EPaymentMethod,
  IPaymentCashFlowSummary,
  IPaymentListResult,
  IPaymentQuery,
  IPaymentTransaction,
  TCashFlowInterval,
  TReceiptPrintSize,
} from '../../../shared/interface/billing.interface';
import { BillingService } from '../../../shared/services/billing.service';

@Component({
  selector: 'app-billing-payment',
  standalone: false,
  templateUrl: './billing-payment.component.html',
  styleUrl: './billing-payment.component.scss',
})
export class BillingPaymentComponent implements OnInit, OnDestroy {
  readonly paymentMethods = Object.values(EPaymentMethod);
  readonly receiptPrintSizes: Array<{ value: TReceiptPrintSize; label: string }> = [
    { value: 'a4', label: 'A4 · เอกสารเต็มหน้า' },
    { value: '80mm', label: '80 มม. · เครื่องพิมพ์ใบเสร็จ' },
    { value: '58mm', label: '58 มม. · เครื่องพิมพ์ใบเสร็จ' },
  ];

  readonly IconReceipt = ReceiptText;
  readonly IconSearch = Search;
  readonly IconRefresh = RefreshCw;
  readonly IconWallet = WalletCards;
  readonly IconPrint = Printer;
  readonly IconInvoice = FileText;

  keyword = '';
  method: EPaymentMethod | '' = '';
  paidFrom = '';
  paidTo = '';
  cashFlowInterval: TCashFlowInterval = 'day';
  page = 1;
  limit = 20;
  receiptPrintSize: TReceiptPrintSize = 'a4';
  readonly paginationOption = [10, 20, 30, 50, 100];

  payments: IPaymentListResult = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    data: [],
  };
  cashFlowSummary: IPaymentCashFlowSummary = this.createEmptyCashFlowSummary();
  cashFlowSummaryIsLive = false;
  isLoading = false;
  isPrinting = '';
  feedback = '';
  feedbackIsError = false;

  private querySubscription?: Subscription;
  private latestRequestId = 0;

  constructor(
    private readonly billingService: BillingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.querySubscription = this.route.queryParams.subscribe((params) => {
      this.keyword = String(params['keyword'] ?? '');
      this.method = this.isPaymentMethod(params['method']) ? params['method'] : '';
      this.paidFrom = String(params['paidFrom'] ?? '');
      this.paidTo = String(params['paidTo'] ?? '');
      this.cashFlowInterval = this.isCashFlowInterval(params['chartInterval'])
        ? params['chartInterval']
        : 'day';
      this.page = this.readPositiveNumber(params['page'], 1);
      this.limit = this.readPositiveNumber(params['limit'], 20);
      void this.loadPayments();
    });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }

  onSearch(): void {
    this.page = 1;
    this.updateUrl();
  }

  refresh(): void {
    void this.loadPayments();
  }

  onFilterChange(): void {
    this.page = 1;
    this.updateUrl();
  }

  onCashFlowIntervalChange(interval: TCashFlowInterval): void {
    if (interval === this.cashFlowInterval) return;
    this.cashFlowInterval = interval;
    this.updateUrl();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.limit = event.pageSize;
    this.updateUrl();
  }

  resetFilters(): void {
    this.keyword = '';
    this.method = '';
    this.paidFrom = '';
    this.paidTo = '';
    this.page = 1;
    this.updateUrl();
  }

  goToInvoice(payment: IPaymentTransaction): void {
    void this.router.navigate(['/portal/billing'], {
      queryParams: { workOrderNo: payment.workOrderNo || null },
    });
  }

  async printReceipt(payment: IPaymentTransaction): Promise<void> {
    if (!payment.paymentNo || this.isPrinting) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.setFeedback('เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต pop-up แล้วลองใหม่อีกครั้ง', true);
      return;
    }

    this.isPrinting = payment.paymentNo;
    try {
      const printableHtml = await this.billingService.getPrintablePaymentReceipt(
        payment.paymentNo,
        this.receiptPrintSize,
      );
      printWindow.document.open();
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      printWindow.focus();
    } catch {
      printWindow.close();
      this.setFeedback('ไม่สามารถเปิดใบเสร็จรับเงินสำหรับพิมพ์ได้', true);
    } finally {
      this.isPrinting = '';
    }
  }

  paymentMethodLabel(method: EPaymentMethod): string {
    return {
      [EPaymentMethod.CASH]: 'เงินสด',
      [EPaymentMethod.TRANSFER]: 'โอนเงิน',
      [EPaymentMethod.CARD]: 'บัตรเครดิต/เดบิต',
      [EPaymentMethod.QR]: 'PromptPay QR',
      [EPaymentMethod.OTHER]: 'อื่น ๆ',
    }[method] ?? method;
  }

  paymentMethodClass(method: EPaymentMethod): string {
    return {
      [EPaymentMethod.CASH]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      [EPaymentMethod.TRANSFER]: 'border-sky-200 bg-sky-50 text-sky-700',
      [EPaymentMethod.CARD]: 'border-violet-200 bg-violet-50 text-violet-700',
      [EPaymentMethod.QR]: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      [EPaymentMethod.OTHER]: 'border-slate-200 bg-slate-100 text-slate-700',
    }[method] ?? 'border-slate-200 bg-slate-100 text-slate-700';
  }

  currency(value: number): string {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  trackByPaymentNo(_: number, payment: IPaymentTransaction): string {
    return payment.paymentNo;
  }

  private updateUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword.trim() || null,
        method: this.method || null,
        paidFrom: this.paidFrom || null,
        paidTo: this.paidTo || null,
        chartInterval: this.cashFlowInterval === 'day' ? null : this.cashFlowInterval,
        page: this.page,
        limit: this.limit,
      },
    });
  }

  private async loadPayments(): Promise<void> {
    const requestId = ++this.latestRequestId;
    this.isLoading = true;
    const query: IPaymentQuery = {
      page: this.page,
      limit: this.limit,
      keyword: this.keyword.trim() || undefined,
      method: this.method || undefined,
      paidFrom: this.paidFrom || undefined,
      paidTo: this.paidTo || undefined,
      chartInterval: this.cashFlowInterval,
    };

    try {
      const [response, summaryResponse] = await Promise.all([
        this.billingService.getPayments(query),
        this.billingService.getPaymentCashFlowSummary({
          keyword: query.keyword,
          method: query.method,
          paidFrom: query.paidFrom,
          paidTo: query.paidTo,
          chartInterval: query.chartInterval,
        }),
      ]);
      if (requestId !== this.latestRequestId) return;

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.payments = response.resultData;
        if (summaryResponse.resultCode === RESPONSE.SUCCESS) {
          this.cashFlowSummary = summaryResponse.resultData;
          this.cashFlowSummaryIsLive = true;
        } else {
          this.cashFlowSummary = this.createFallbackCashFlowSummary(
            response.resultData.data,
            this.cashFlowInterval,
          );
          this.cashFlowSummaryIsLive = false;
        }
        this.feedback = '';
      } else {
        this.setFeedback(response.developerMessage || 'ไม่สามารถโหลดประวัติการชำระเงินได้', true);
      }
    } catch {
      if (requestId === this.latestRequestId) {
        this.setFeedback('ไม่สามารถโหลดประวัติการชำระเงินได้ กรุณาลองใหม่อีกครั้ง', true);
      }
    } finally {
      if (requestId === this.latestRequestId) this.isLoading = false;
    }
  }

  private isPaymentMethod(value: unknown): value is EPaymentMethod {
    return typeof value === 'string' && this.paymentMethods.includes(value as EPaymentMethod);
  }

  private isCashFlowInterval(value: unknown): value is TCashFlowInterval {
    return value === 'day' || value === 'week' || value === 'month';
  }

  private readPositiveNumber(value: unknown, fallback: number): number {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  private createEmptyCashFlowSummary(): IPaymentCashFlowSummary {
    return {
      interval: 'day',
      totalAmount: 0,
      totalTransactions: 0,
      averagePeriodAmount: 0,
      series: [],
      byMethod: [],
    };
  }

  private createFallbackCashFlowSummary(
    payments: IPaymentTransaction[],
    interval: TCashFlowInterval,
  ): IPaymentCashFlowSummary {
    const periods = new Map<string, { amount: number; transactions: number }>();
    const byMethod = new Map<EPaymentMethod, { amount: number; transactions: number }>();
    let latestPaymentAt: string | undefined;
    for (const payment of payments) {
      const amount = Number(payment.amount ?? 0);
      const parsedDate = payment.paidAt ? new Date(payment.paidAt) : null;
      if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
        const period = this.toCashFlowPeriodKey(parsedDate, interval);
        const current = periods.get(period) ?? { amount: 0, transactions: 0 };
        periods.set(period, { amount: current.amount + amount, transactions: current.transactions + 1 });
        if (!latestPaymentAt || parsedDate.getTime() > new Date(latestPaymentAt).getTime()) {
          latestPaymentAt = payment.paidAt;
        }
      }
      const methodTotal = byMethod.get(payment.method) ?? { amount: 0, transactions: 0 };
      byMethod.set(payment.method, {
        amount: methodTotal.amount + amount,
        transactions: methodTotal.transactions + 1,
      });
    }
    const periodLimit = interval === 'day' ? 14 : 12;
    const series = Array.from(periods.entries())
      .map(([period, value]) => ({ period, ...value }))
      .sort((left, right) => left.period.localeCompare(right.period))
      .slice(-periodLimit);
    const totalAmount = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
    return {
      interval,
      totalAmount,
      totalTransactions: payments.length,
      averagePeriodAmount: series.length
        ? series.reduce((sum, item) => sum + item.amount, 0) / series.length
        : 0,
      latestPaymentAt,
      series,
      byMethod: Array.from(byMethod.entries())
        .map(([method, value]) => ({ method, ...value }))
        .sort((left, right) => right.amount - left.amount),
    };
  }

  private toBangkokDateKey(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }

  private toCashFlowPeriodKey(date: Date, interval: TCashFlowInterval): string {
    const dateKey = this.toBangkokDateKey(date);
    if (interval === 'day') return dateKey;
    if (interval === 'month') return dateKey.slice(0, 7);
    const utcDate = new Date(`${dateKey}T12:00:00Z`);
    const weekDate = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate()));
    weekDate.setUTCDate(weekDate.getUTCDate() + 4 - (weekDate.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(weekDate.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((weekDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${weekDate.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  private setFeedback(message: string, isError: boolean): void {
    this.feedback = message;
    this.feedbackIsError = isError;
  }
}
