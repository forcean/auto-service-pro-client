import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Banknote,
  Building2,
  Calendar,
  CarFront,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Info,
  PackagePlus,
  Printer,
  QrCode,
  Receipt,
  RotateCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  User,
  Wallet,
  Wrench,
  X,
} from 'lucide-angular';

import { RESPONSE } from '../../../shared/enum/response.enum';
import {
  EInvoiceStatus,
  EPaymentMethod,
  IInvoice,
  IReadyToInvoiceWorkOrder,
} from '../../../shared/interface/billing.interface';
import { BillingService } from '../../../shared/services/billing.service';

export type TQueueFilterTab = 'ALL' | 'READY' | 'UNPAID' | 'COMPLETED';

@Component({
  selector: 'app-billing-workspace',
  standalone: false,
  templateUrl: './billing-workspace.component.html',
  styleUrl: './billing-workspace.component.scss',
})
export class BillingWorkspaceComponent implements OnInit {
  invoices: IInvoice[] = [];
  readyWorkOrders: IReadyToInvoiceWorkOrder[] = [];
  selectedInvoice: IInvoice | null = null;
  selectedWorkOrder: IReadyToInvoiceWorkOrder | null = null;
  isLoading = true;
  isCreatingInvoice = false;
  isReceivingPayment = false;
  isPaymentModalOpen = false;
  feedback = '';
  feedbackIsError = false;
  keyword = '';
  requestedWorkOrderNo = '';
  activeTab: TQueueFilterTab = 'ALL';
  copiedText = '';

  paymentForm = {
    amount: 0,
    method: EPaymentMethod.QR,
    reference: '',
    note: '',
  };

  readonly invoiceStatuses = EInvoiceStatus;
  readonly paymentMethods = Object.values(EPaymentMethod);
  readonly paymentMethodsEnum = EPaymentMethod;

  // Lucide Icons
  readonly IconReceipt = Receipt;
  readonly IconRefresh = RotateCw;
  readonly IconSearch = Search;
  readonly IconCheckCircle = CheckCircle2;
  readonly IconClock = Clock;
  readonly IconAlertCircle = AlertCircle;
  readonly IconWallet = Wallet;
  readonly IconPrinter = Printer;
  readonly IconFileText = FileText;
  readonly IconCar = CarFront;
  readonly IconUser = User;
  readonly IconFilter = SlidersHorizontal;
  readonly IconCheck = Check;
  readonly IconActivity = Activity;
  readonly IconShieldCheck = ShieldCheck;
  readonly IconCreditCard = CreditCard;
  readonly IconArrowUpRight = ArrowUpRight;
  readonly IconQrCode = QrCode;
  readonly IconBanknote = Banknote;
  readonly IconBuilding = Building2;
  readonly IconClose = X;
  readonly IconCopy = Copy;
  readonly IconExternalLink = ExternalLink;
  readonly IconDollarSign = DollarSign;
  readonly IconPlus = PackagePlus;
  readonly IconInfo = Info;
  readonly IconCalendar = Calendar;
  readonly IconWrench = Wrench;
  readonly IconSparkles = Sparkles;

  constructor(
    private readonly billingService: BillingService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.requestedWorkOrderNo = params.get('workOrderNo') ?? '';
      void this.loadWorkspace();
    });
  }

  get visibleWorkOrders(): IReadyToInvoiceWorkOrder[] {
    let list = [...this.readyWorkOrders];

    if (this.activeTab === 'READY') {
      list = list.filter((item) => item.canCreateInvoice && item.status !== 'COMPLETED');
    } else if (this.activeTab === 'UNPAID') {
      list = list.filter((item) => {
        const inv = this.invoices.find((i) => i.workOrderNo === item.workOrderNo);
        return inv && (inv.status === EInvoiceStatus.ISSUED || inv.status === EInvoiceStatus.PARTIALLY_PAID);
      });
    } else if (this.activeTab === 'COMPLETED') {
      list = list.filter((item) => item.status === 'COMPLETED');
    }

    const keyword = this.keyword.trim().toLowerCase();
    if (!keyword) return list;

    return list.filter((workOrder) =>
      [
        workOrder.workOrderNo,
        workOrder.vehicle?.licensePlate,
        workOrder.vehicle?.province,
        workOrder.vehicle?.firstname,
        workOrder.vehicle?.lastname,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }

  get readyToInvoiceCount(): number {
    return this.readyWorkOrders.filter((item) => item.status === 'READY_DELIVERY' && item.canCreateInvoice).length;
  }

  get issuedCount(): number {
    return this.invoices.filter(
      (item) => item.status === EInvoiceStatus.ISSUED || item.status === EInvoiceStatus.PARTIALLY_PAID,
    ).length;
  }

  get paidCount(): number {
    return this.invoices.filter((item) => item.status === EInvoiceStatus.PAID).length;
  }

  get outstandingAmount(): number {
    return Math.max(0, (this.selectedInvoice?.grandTotal ?? 0) - (this.selectedInvoice?.paidAmount ?? 0));
  }

  setActiveTab(tab: TQueueFilterTab): void {
    this.activeTab = tab;
  }

  async loadWorkspace(): Promise<void> {
    this.isLoading = true;
    try {
      const [invoiceResponse, workOrderResponse] = await Promise.all([
        this.billingService.getInvoices({ page: 1, limit: 100 }),
        this.billingService.getReadyWorkOrders(),
      ]);
      if (invoiceResponse.resultCode !== RESPONSE.SUCCESS) {
        this.showFeedback(this.errorMessage(invoiceResponse), true);
        return;
      }
      if (workOrderResponse.resultCode !== RESPONSE.SUCCESS) {
        this.showFeedback(this.errorMessage(workOrderResponse), true);
        return;
      }

      this.invoices = invoiceResponse.resultData.data;
      this.readyWorkOrders = workOrderResponse.resultData;
      this.restoreSelection();
    } catch {
      this.showFeedback('ไม่สามารถโหลดข้อมูล Billing ได้ กรุณาลองใหม่อีกครั้ง', true);
    } finally {
      this.isLoading = false;
    }
  }

  selectWorkOrder(workOrder: IReadyToInvoiceWorkOrder): void {
    this.selectedWorkOrder = workOrder;
    this.selectedInvoice = this.invoices.find((invoice) => invoice.workOrderNo === workOrder.workOrderNo) ?? null;
    this.syncQuery(workOrder.workOrderNo);
  }

  selectInvoice(invoice: IInvoice): void {
    this.selectedInvoice = invoice;
    this.selectedWorkOrder = this.readyWorkOrders.find((item) => item.workOrderNo === invoice.workOrderNo) ?? null;
    this.syncQuery(invoice.workOrderNo);
  }

  async createInvoice(): Promise<void> {
    if (!this.selectedWorkOrder || !this.selectedWorkOrder.canCreateInvoice || this.isCreatingInvoice) return;
    this.isCreatingInvoice = true;
    try {
      const response = await this.billingService.createInvoice(this.selectedWorkOrder._id);
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.showFeedback(this.errorMessage(response), true);
        return;
      }
      this.selectedInvoice = response.resultData;
      this.showFeedback(`สร้างใบแจ้งหนี้ ${response.resultData.invoiceNo} แล้ว`, false);
      await this.loadWorkspace();
    } catch {
      this.showFeedback('สร้างใบแจ้งหนี้ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', true);
    } finally {
      this.isCreatingInvoice = false;
    }
  }

  openPaymentModal(): void {
    if (!this.selectedInvoice || this.outstandingAmount <= 0 || this.isTerminalInvoice(this.selectedInvoice)) return;
    this.paymentForm = { amount: this.outstandingAmount, method: EPaymentMethod.QR, reference: '', note: '' };
    this.isPaymentModalOpen = true;
  }

  closePaymentModal(): void {
    if (!this.isReceivingPayment) this.isPaymentModalOpen = false;
  }

  selectPaymentMethod(method: EPaymentMethod | string): void {
    this.paymentForm.method = method as EPaymentMethod;
  }

  setFullPaymentAmount(): void {
    this.paymentForm.amount = this.outstandingAmount;
  }

  setHalfPaymentAmount(): void {
    this.paymentForm.amount = Math.round((this.outstandingAmount / 2) * 100) / 100;
  }

  async receivePayment(): Promise<void> {
    const invoice = this.selectedInvoice;
    const amount = Number(this.paymentForm.amount);
    if (!invoice || this.isReceivingPayment) return;
    if (!Number.isFinite(amount) || amount <= 0 || amount > this.outstandingAmount + 0.005) {
      this.showFeedback(`จำนวนรับชำระต้องมากกว่า 0 และไม่เกิน ${this.currency(this.outstandingAmount)} บาท`, true);
      return;
    }

    this.isReceivingPayment = true;
    try {
      const response = await this.billingService.receivePayment(invoice._id, {
        amount,
        method: this.paymentForm.method,
        reference: this.paymentForm.reference.trim() || undefined,
        note: this.paymentForm.note.trim() || undefined,
      });
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.showFeedback(this.errorMessage(response), true);
        return;
      }
      this.selectedInvoice = response.resultData;
      this.isPaymentModalOpen = false;
      const isFullyPaid = response.resultData.status === EInvoiceStatus.PAID;
      this.showFeedback(
        isFullyPaid
          ? 'รับชำระครบแล้ว ระบบปิดใบสั่งงานและสร้างประวัติการซ่อมให้เรียบร้อย'
          : 'บันทึกรับชำระบางส่วนแล้ว',
        false,
      );
      await this.loadWorkspace();
    } catch {
      this.showFeedback('บันทึกรับชำระไม่สำเร็จ กรุณาลองใหม่อีกครั้ง', true);
    } finally {
      this.isReceivingPayment = false;
    }
  }

  goToWorkOrder(): void {
    const workOrderNo = this.selectedInvoice?.workOrderNo ?? this.selectedWorkOrder?.workOrderNo;
    if (workOrderNo) void this.router.navigate(['/portal/repair/work-orders', workOrderNo]);
  }

  async printInvoice(): Promise<void> {
    const invoice = this.selectedInvoice;
    if (!invoice) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.showFeedback('เบราว์เซอร์บล็อกหน้าต่างพิมพ์ กรุณาอนุญาต pop-up แล้วลองอีกครั้ง', true);
      return;
    }

    try {
      const printableHtml = await this.billingService.getPrintableInvoice(invoice._id);
      printWindow.document.open();
      printWindow.document.write(printableHtml);
      printWindow.document.close();
      printWindow.focus();
    } catch {
      printWindow.close();
      this.showFeedback('ไม่สามารถเปิดเอกสาร Invoice สำหรับพิมพ์ได้', true);
    }
  }

  copyToClipboard(text: string): void {
    if (!text) return;
    void navigator.clipboard.writeText(text);
    this.copiedText = text;
    setTimeout(() => {
      if (this.copiedText === text) this.copiedText = '';
    }, 2000);
  }

  invoiceStatusLabel(status: EInvoiceStatus): string {
    return {
      [EInvoiceStatus.ISSUED]: 'รอชำระเงิน',
      [EInvoiceStatus.PARTIALLY_PAID]: 'ชำระบางส่วน',
      [EInvoiceStatus.PAID]: 'ชำระครบแล้ว',
      [EInvoiceStatus.VOID]: 'ยกเลิกใบแจ้งหนี้',
      [EInvoiceStatus.PARTIALLY_REFUNDED]: 'คืนเงินบางส่วน',
      [EInvoiceStatus.REFUNDED]: 'คืนเงินแล้ว',
    }[status] ?? status;
  }

  invoiceStatusClass(status: EInvoiceStatus): string {
    return {
      [EInvoiceStatus.ISSUED]: 'bg-amber-50 text-amber-700 ring-amber-200 border-amber-200',
      [EInvoiceStatus.PARTIALLY_PAID]: 'bg-sky-50 text-sky-700 ring-sky-200 border-sky-200',
      [EInvoiceStatus.PAID]: 'bg-emerald-50 text-emerald-700 ring-emerald-200 border-emerald-200',
      [EInvoiceStatus.VOID]: 'bg-slate-100 text-slate-600 ring-slate-200 border-slate-200',
      [EInvoiceStatus.PARTIALLY_REFUNDED]: 'bg-violet-50 text-violet-700 ring-violet-200 border-violet-200',
      [EInvoiceStatus.REFUNDED]: 'bg-slate-100 text-slate-600 ring-slate-200 border-slate-200',
    }[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200 border-slate-200';
  }

  paymentMethodLabel(method: EPaymentMethod): string {
    return { CASH: 'เงินสด', TRANSFER: 'โอนเงิน', CARD: 'บัตรเครดิต/เดบิต', QR: 'PromptPay QR', OTHER: 'อื่น ๆ' }[method];
  }

  currency(value: number): string {
    return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value || 0);
  }

  private restoreSelection(): void {
    const workOrderNo = this.requestedWorkOrderNo || this.selectedInvoice?.workOrderNo || this.selectedWorkOrder?.workOrderNo;
    if (!workOrderNo) return;
    this.selectedWorkOrder = this.readyWorkOrders.find((item) => item.workOrderNo === workOrderNo) ?? null;
    this.selectedInvoice = this.invoices.find((item) => item.workOrderNo === workOrderNo) ?? null;
  }

  private syncQuery(workOrderNo: string): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { workOrderNo }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private isTerminalInvoice(invoice: IInvoice): boolean {
    return [EInvoiceStatus.PAID, EInvoiceStatus.VOID, EInvoiceStatus.REFUNDED].includes(invoice.status);
  }

  private errorMessage(response: { developerMessage?: string }): string {
    return response.developerMessage || 'ระบบไม่สามารถทำรายการได้';
  }

  private showFeedback(message: string, isError: boolean): void {
    this.feedback = message;
    this.feedbackIsError = isError;
  }
}
