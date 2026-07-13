import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  IReceiveStockModal,
  ReceiveStockModalService,
} from './receive-stock-modal.service';
import { ICreateStockReceiveRequest } from '../../interface/stock-management.interface';
import { ProductService } from '../../services/product.service';
import {
  IProducts,
  IQueryListProduct,
} from '../../interface/product-list.interface';
import { firstValueFrom } from 'rxjs';
import { RESPONSE } from '../../enum/response.enum';

@Component({
  selector: 'app-receive-stock-modal',
  standalone: false,
  templateUrl: './receive-stock-modal.component.html',
  styleUrls: ['./receive-stock-modal.component.scss'],
})
export class ReceiveStockModalComponent implements OnInit {
  @Output() confirm = new EventEmitter<{
    productId: string;
    body: ICreateStockReceiveRequest;
  }>();

  optionModal!: IReceiveStockModal;
  form: FormGroup;
  loadingProduct = false;
  products: IProducts[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly receiveStockModalService: ReceiveStockModalService,
    private readonly productService: ProductService,
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

  async searchProduct(keyword: string): Promise<void> {
    if (!keyword.trim()) {
      this.products = [];
      return;
    }
    this.loadingProduct = true;
    try {
      const params: any = {
        // page: 1,
        // limit: 10,
        sku: keyword,
      };
      const res = await this.productService.getListProduct(params);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.products = res.resultData.products;
      } else {
        // this.handleFailResponse()
      }
    } catch (error) {
      console.error(error);
      // this.handleCommonError()
    } finally {
      this.loadingProduct = false;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.getRawValue();

    this.confirm.emit({
      productId: value.productId,
      body: {
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
