import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  EPaymentMethod,
  EWorkOrderPaymentType,
  ICreateWorkOrderPaymentRequest,
} from '../../interface/billing.interface';

@Component({
  selector: 'app-work-order-payment-modal',
  standalone: false,
  templateUrl: './work-order-payment-modal.component.html',
})
export class WorkOrderPaymentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() availableCredit = 0;
  @Input() isSubmitting = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitPayment = new EventEmitter<ICreateWorkOrderPaymentRequest>();

  readonly paymentMethods = Object.values(EPaymentMethod);
  readonly paymentTypes = Object.values(EWorkOrderPaymentType);

  form: ICreateWorkOrderPaymentRequest = this.createDefaultForm();
  validationMessage = '';
  isPaymentTypeDropdownOpen = false;
  isPaymentMethodDropdownOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.form = this.createDefaultForm();
      this.validationMessage = '';
      this.closePaymentDropdowns();
    }
  }

  onBackdropClick(): void {
    if (!this.isSubmitting) this.close.emit();
  }

  onModalContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) this.closePaymentDropdowns();
    event.stopPropagation();
  }

  syncPaymentDropdown(dropdown: 'type' | 'method', isOpen: boolean): void {
    if (dropdown === 'type') {
      this.isPaymentTypeDropdownOpen = isOpen;
      if (isOpen) this.isPaymentMethodDropdownOpen = false;
      return;
    }

    this.isPaymentMethodDropdownOpen = isOpen;
    if (isOpen) this.isPaymentTypeDropdownOpen = false;
  }

  closePaymentDropdowns(): void {
    this.isPaymentTypeDropdownOpen = false;
    this.isPaymentMethodDropdownOpen = false;
  }

  onSubmit(): void {
    const amount = Number(this.form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.validationMessage = 'กรุณาระบุจำนวนเงินที่มากกว่า 0';
      return;
    }

    this.validationMessage = '';
    this.submitPayment.emit({
      amount,
      type: this.form.type,
      method: this.form.method,
      reference: this.form.reference?.trim() || undefined,
      note: this.form.note?.trim() || undefined,
    });
  }

  paymentTypeLabel(type: EWorkOrderPaymentType): string {
    return type === EWorkOrderPaymentType.DEPOSIT ? 'เงินมัดจำ' : 'ชำระระหว่างซ่อม';
  }

  paymentTypeHint(type: EWorkOrderPaymentType): string {
    return type === EWorkOrderPaymentType.DEPOSIT
      ? 'รับก่อนเริ่มงาน หรือก่อนสั่งอะไหล่'
      : 'รับชำระเป็นงวดขณะกำลังดำเนินการซ่อม';
  }

  paymentMethodLabel(method: EPaymentMethod): string {
    return { CASH: 'เงินสด', TRANSFER: 'โอนเงิน', CARD: 'บัตร', QR: 'QR Payment', OTHER: 'อื่น ๆ' }[method];
  }

  private createDefaultForm(): ICreateWorkOrderPaymentRequest {
    return {
      amount: 0,
      method: EPaymentMethod.QR,
      type: EWorkOrderPaymentType.DEPOSIT,
      reference: '',
      note: '',
    };
  }
}
