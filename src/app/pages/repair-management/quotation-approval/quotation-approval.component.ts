import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import {
  EQuotationStatus,
  IApproveQuotationRequest,
  IQuotationListItem,
} from '../../../shared/interface/quotation.interface';
import { QuotationService } from '../../../shared/services/quotation.service';

@Component({
  selector: 'app-quotation-approval',
  standalone: false,
  templateUrl: './quotation-approval.component.html',
  styleUrl: './quotation-approval.component.scss',
})
export class QuotationApprovalComponent implements OnInit {
  readonly approvalMethods: Array<{
    value: IApproveQuotationRequest['method'];
    label: string;
  }> = [
    { value: 'PHONE', label: 'โทรศัพท์' },
    { value: 'LINE', label: 'LINE' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'IN_PERSON', label: 'พบลูกค้าด้วยตนเอง' },
  ];

  quotationNo = '';
  quotation?: IQuotationListItem;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  approvalForm: IApproveQuotationRequest = {
    customerName: '',
    method: 'PHONE',
    note: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotationService: QuotationService,
  ) {}

  ngOnInit(): void {
    this.quotationNo = this.route.snapshot.paramMap.get('quotationNo') ?? '';

    if (!this.quotationNo) {
      void this.backToQuotations();
      return;
    }

    void this.loadQuotation();
  }

  get canApprove(): boolean {
    return this.quotation?.status === EQuotationStatus.PENDING_APPROVAL;
  }

  get isDraft(): boolean {
    return this.quotation?.status === EQuotationStatus.DRAFT;
  }

  get isApproved(): boolean {
    return this.quotation?.status === EQuotationStatus.APPROVED;
  }

  async loadQuotation(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.quotationService.getQuotationDetail(this.quotationNo);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถโหลดใบเสนอราคาได้';
        return;
      }

      this.quotation = response.resultData;
    } catch (error) {
      console.error('Failed to load quotation for approval:', error);
      this.errorMessage = 'ไม่สามารถโหลดใบเสนอราคาได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
  }

  async approve(): Promise<void> {
    if (!this.canApprove || this.isSubmitting) return;

    const customerName = this.approvalForm.customerName.trim();
    if (!customerName) {
      this.errorMessage = 'กรุณาระบุชื่อผู้ที่ยืนยันการอนุมัติ';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.quotationService.approveQuotation(this.quotationNo, {
        customerName,
        method: this.approvalForm.method,
        ...(this.approvalForm.note?.trim()
          ? { note: this.approvalForm.note.trim() }
          : {}),
      });

      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถบันทึกการอนุมัติได้';
        return;
      }

      await this.loadQuotation();
      this.successMessage = 'บันทึกการอนุมัติแล้ว สามารถดำเนินการจัดทีมซ่อมต่อได้';
    } catch (error) {
      console.error('Failed to approve quotation:', error);
      this.errorMessage = 'ไม่สามารถบันทึกการอนุมัติได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isSubmitting = false;
    }
  }

  async submitForApproval(): Promise<void> {
    if (!this.isDraft || this.isSubmitting) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await this.quotationService.submitForApproval(this.quotationNo);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถส่งใบเสนอราคาให้ลูกค้าพิจารณาได้';
        return;
      }

      await this.loadQuotation();
      this.successMessage = 'ส่งใบเสนอราคาให้ลูกค้าพิจารณาแล้ว กรุณาบันทึกผลการตัดสินใจเมื่อลูกค้าตอบกลับ';
    } catch (error) {
      console.error('Failed to submit quotation for approval:', error);
      this.errorMessage = 'ไม่สามารถส่งใบเสนอราคาให้ลูกค้าพิจารณาได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isSubmitting = false;
    }
  }

  async continueToWorkOrder(): Promise<void> {
    if (!this.quotation?.workOrderNo) return;
    await this.router.navigate(['/portal/repair/work-orders', this.quotation.workOrderNo]);
  }

  async backToQuotations(): Promise<void> {
    await this.router.navigate(['/portal/repair/quotation']);
  }

  statusLabel(status?: EQuotationStatus): string {
    const labels: Record<EQuotationStatus, string> = {
      [EQuotationStatus.DRAFT]: 'ฉบับร่าง',
      [EQuotationStatus.WAITING_APPROVAL]: 'รอลูกค้าพิจารณา',
      [EQuotationStatus.PENDING_APPROVAL]: 'รอบันทึกการอนุมัติ',
      [EQuotationStatus.APPROVED]: 'อนุมัติแล้ว',
      [EQuotationStatus.REJECTED]: 'ไม่อนุมัติ',
      [EQuotationStatus.EXPIRED]: 'หมดอายุ',
      [EQuotationStatus.CANCELLED]: 'ยกเลิก',
    };

    return status ? labels[status] : '-';
  }
}
