import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  IReceiveStockModal,
  ReceiveStockModalService,
} from './receive-stock-modal.service';

@Component({
  selector: 'app-receive-stock-modal',
  standalone: false,
  templateUrl: './receive-stock-modal.component.html',
  styleUrls: ['./receive-stock-modal.component.scss'],
})
export class ReceiveStockModalComponent implements OnInit {
  @Output()
  confirm = new EventEmitter<{
    productId: number;

    payload: {
      quantity: number;

      referenceType?: string;

      referenceId?: string;

      remark?: string;
    };
  }>();

  optionModal!: IReceiveStockModal;

  form: FormGroup;

  loadingProduct = false;

  products: any[] = [];

  constructor(
    private readonly fb: FormBuilder,

    private readonly receiveStockModalService: ReceiveStockModalService,
  ) {
    this.form = this.fb.group({
      productId: [null, Validators.required],

      quantity: [1, [Validators.required, Validators.min(1)]],

      referenceType: [null],

      referenceId: [''],

      remark: [''],
    });
  }

  ngOnInit(): void {
    this.receiveStockModalService.isOpen.subscribe((modal) => {
      this.optionModal = modal;

      if (modal.isOpen) {
        this.resetForm();
      }
    });
  }

  searchProduct(keyword: string): void {
    this.loadingProduct = true;

    /**

     * TODO

     * ยิง API ค้นหาสินค้า

     */

    console.log('search product : ', keyword);

    setTimeout(() => {
      this.products = [
        {
          productId: 1,

          sku: 'SKU-0001',

          name: 'iPhone 16 Pro Max',
        },

        {
          productId: 2,

          sku: 'SKU-0002',

          name: 'Samsung S25 Ultra',
        },
      ];

      this.loadingProduct = false;
    }, 500);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    this.confirm.emit({
      productId: value.productId,

      payload: {
        quantity: value.quantity,

        referenceType: value.referenceType || undefined,

        referenceId: value.referenceId?.trim() || undefined,

        remark: value.remark?.trim() || undefined,
      },
    });

    this.closeModal();
  }

  closeModal(): void {
    this.resetForm();

    this.receiveStockModalService.close(this.optionModal);
  }

  private resetForm(): void {
    this.form.reset({
      productId: null,

      quantity: 1,

      referenceType: null,

      referenceId: '',

      remark: '',
    });

    this.products = [];

    this.loadingProduct = false;
  }
}
