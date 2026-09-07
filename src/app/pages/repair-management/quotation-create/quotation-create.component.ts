import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
} from 'rxjs';

import { RESPONSE } from '../../../shared/enum/response.enum';
import {
  EQuotationItemType,
  ICreateQuotationRequest,
  IQuotationItem,
  IQuotationItemFormValue,
  IQuotationListItem,
  IUpdateQuotationRequest,
} from '../../../shared/interface/quotation.interface';
import {
  IProducts,
  IQueryListProduct,
} from '../../../shared/interface/product-list.interface';
import { ProductService } from '../../../shared/services/product.service';
import { QuotationService } from '../../../shared/services/quotation.service';
import { WorkOrderService } from '../../../shared/services/work-order.service';

@Component({
  selector: 'app-quotation-create',
  standalone: false,
  templateUrl: './quotation-create.component.html',
  styleUrl: './quotation-create.component.scss',
})
export class QuotationCreateComponent implements OnInit, OnDestroy {
  quotationForm!: FormGroup;
  quotationId: string | null = null;
  workOrderNo: string | null = null;
  workOrderId: string | null = null;

  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  isSearching = false;

  itemTypes = Object.values(EQuotationItemType);

  productSearchResults: Record<number, IProducts[]> = {};
  activeSearchIndex: number | null = null;

  private searchSubject = new Subject<{
    keyword: string;
    index: number;
  }>();

  private searchSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private quotationService: QuotationService,
    private workOrderService: WorkOrderService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.initForm();
    this.setupProductSearch();

    try {
      this.quotationId = this.route.snapshot.queryParamMap.get('id');
      this.workOrderNo = this.route.snapshot.queryParamMap.get('workOrderNo');

      if (this.quotationId) {
        this.isEditMode = true;
        await this.loadQuotation(this.quotationId);
        return;
      }

      if (this.workOrderNo) {
        await this.loadWorkOrder(this.workOrderNo);
        this.addItem();
        return;
      }

      await this.navigateBack();
    } catch (error) {
      console.error('Failed to initialize quotation:', error);
      await this.navigateBack();
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.searchSubject.complete();
  }

  private initForm(): void {
    this.quotationForm = this.fb.group({
      workOrderId: ['', [Validators.required]],
      validUntil: [''],
      includeVat: [true],
      taxPercent: [7, [Validators.required, Validators.min(0)]],
      discountAmount: [0, [Validators.min(0)]],
      customerRemark: [''],
      internalRemark: [''],
      items: this.fb.array([]),
    });
  }

  get items(): FormArray {
    return this.quotationForm.get('items') as FormArray;
  }

  createItemGroup(item?: Partial<IQuotationItem>): FormGroup {
    const group = this.fb.group({
      itemType: [
        item?.itemType ?? EQuotationItemType.PART,
        [Validators.required],
      ],
      productId: [item?.productId ?? ''],
      sku: [item?.sku ?? ''],
      description: [item?.description ?? ''],
      quantity: [item?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      unitPrice: [
        item?.unitPrice ?? 0,
        [Validators.required, Validators.min(0)],
      ],
      discountAmount: [item?.discountAmount ?? 0, [Validators.min(0)]],
      remark: [item?.remark ?? ''],
    });

    const itemType = group.get('itemType')?.value;

    if (itemType) {
      this.handleItemTypeChange(group, itemType as EQuotationItemType);
    }

    group
      .get('itemType')
      ?.valueChanges.subscribe((type: EQuotationItemType | null) => {
        try {
          if (!type) {
            return;
          }

          this.handleItemTypeChange(group, type);
        } catch (error) {
          console.error('Failed to change item type:', error);
        }
      });

    return group;
  }

  addItem(): void {
    try {
      this.items.push(this.createItemGroup());
    } catch (error) {
      console.error('Failed to add quotation item:', error);
    }
  }

  removeItem(index: number): void {
    try {
      this.items.removeAt(index);
      this.productSearchResults = {};
      this.activeSearchIndex = null;
    } catch (error) {
      console.error('Failed to remove quotation item:', error);
    }
  }

  private handleItemTypeChange(
    group: FormGroup,
    type: EQuotationItemType,
  ): void {
    const productId = group.get('productId');
    const sku = group.get('sku');
    const description = group.get('description');

    if (type === EQuotationItemType.PART) {
      description?.clearValidators();
    } else {
      productId?.reset('', { emitEvent: false });
      sku?.reset('', { emitEvent: false });

      description?.setValidators([Validators.required]);
    }

    description?.updateValueAndValidity({
      emitEvent: false,
    });
  }

  private async loadWorkOrder(workOrderNo: string): Promise<void> {
    this.isLoading = true;

    try {
      const response =
        await this.workOrderService.getWorkOrderDetail(workOrderNo);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        throw new Error('Failed to get work order');
      }

      const workOrder = response.resultData;
      const workOrderId = workOrder?._id;

      if (!workOrderId) {
        throw new Error('Work order id not found');
      }

      this.workOrderId = workOrderId;

      this.quotationForm.patchValue({
        workOrderId,
      });
    } catch (error) {
      console.error('Failed to load work order:', error);
      await this.navigateBack();
    } finally {
      this.isLoading = false;
    }
  }

  private async loadQuotation(quotationId: string): Promise<void> {
    this.isLoading = true;

    try {
      const response =
        await this.quotationService.getQuotationDetail(quotationId);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        throw new Error('Failed to get quotation');
      }

      const quotation: IQuotationListItem = response.resultData;

      if (!quotation.workOrderId) {
        throw new Error('Work order id not found');
      }

      this.workOrderId = quotation.workOrderId;

      this.quotationForm.patchValue({
        workOrderId: quotation.workOrderId,
        validUntil: this.formatDateForInput(quotation.validUntil),
        includeVat: quotation.includeVat,
        taxPercent: quotation.taxPercent,
        discountAmount: quotation.discountAmount,
        customerRemark: quotation.customerRemark ?? '',
        internalRemark: quotation.internalRemark ?? '',
      });

      this.items.clear();

      if (quotation.items.length > 0) {
        quotation.items.forEach((item) => {
          this.items.push(this.createItemGroup(item));
        });
      } else {
        this.addItem();
      }
    } catch (error) {
      console.error('Failed to load quotation:', error);
      await this.navigateBack();
    } finally {
      this.isLoading = false;
    }
  }

  private   setupProductSearch(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(
          (prev, curr) =>
            prev.keyword === curr.keyword && prev.index === curr.index,
        ),
      )
      .subscribe(async ({ keyword, index }) => {
        try {
          await this.searchProduct(keyword, index);
        } catch (error) {
          console.error('Failed to search product:', error);
        }
      });
  }

  private async searchProduct(keyword: string, index: number): Promise<void> {
    const searchKeyword = keyword.trim();

    if (!searchKeyword) {
      this.productSearchResults[index] = [];
      return;
    }

    this.isSearching = true;

    try {
      const queryParams: IQueryListProduct = {
        page: 1,
        limit: 20,
        sku: searchKeyword,
      };

      const response = await this.productService.getListProduct(queryParams);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.productSearchResults[index] = [];
        return;
      }

      this.productSearchResults[index] = response.resultData?.products ?? [];
    } catch (error) {
      console.error('Failed to search products:', error);
      this.productSearchResults[index] = [];
    } finally {
      this.isSearching = false;
    }
  }

  onProductSearch(event: Event, index: number): void {
    try {
      const keyword = (event.target as HTMLInputElement).value;

      const itemGroup = this.items.at(index);

      this.activeSearchIndex = index;

      itemGroup.patchValue(
        {
          productId: '',
          sku: '',
          description: keyword,
        },
        {
          emitEvent: false,
        },
      );

      this.searchSubject.next({
        keyword,
        index,
      });
    } catch (error) {
      console.error('Failed to handle product search:', error);
    }
  }

  selectProduct(product: IProducts, index: number): void {
    try {
      const itemGroup = this.items.at(index);

      const unitPrice =
        product.prices?.retail ??
        product.prices?.wholesale ??
        product.prices?.cost ??
        0;

      itemGroup.patchValue({
        productId: product.id,
        sku: product.code,
        description: product.name,
        unitPrice,
      });

      this.productSearchResults[index] = [];
      this.activeSearchIndex = null;
    } catch (error) {
      console.error('Failed to select product:', error);
    }
  }

  get subtotal(): number {
    return this.items.controls.reduce((sum, item) => {
      const quantity = Number(item.get('quantity')?.value) || 0;

      const unitPrice = Number(item.get('unitPrice')?.value) || 0;

      const discountAmount = Number(item.get('discountAmount')?.value) || 0;

      return sum + Math.max(0, quantity * unitPrice - discountAmount);
    }, 0);
  }

  get grandTotal(): number {
    const discountAmount =
      Number(this.quotationForm.get('discountAmount')?.value) || 0;

    const taxPercent = Number(this.quotationForm.get('taxPercent')?.value) || 0;

    const includeVat = this.quotationForm.get('includeVat')?.value ?? false;

    const beforeVat = Math.max(0, this.subtotal - discountAmount);

    const vat = includeVat ? (beforeVat * taxPercent) / 100 : 0;

    return beforeVat + vat;
  }

  async onSubmit(): Promise<void> {
    try {
      if (this.quotationForm.invalid) {
        this.quotationForm.markAllAsTouched();
        return;
      }

      if (!this.items.length) {
        return;
      }

      if (this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;

      const payload = this.buildPayload();

      if (this.isEditMode && this.quotationId) {
        await this.updateQuotation(this.quotationId, payload);

        return;
      }

      await this.createQuotation(payload);
    } catch (error) {
      console.error('Failed to save quotation:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async createQuotation(
    payload: ICreateQuotationRequest,
  ): Promise<void> {
    try {
      const response = await this.quotationService.createQuotation(payload);

      if (response.resultCode !== RESPONSE.SUCCESS) {
        throw new Error('Failed to create quotation');
      }

      await this.navigateBack();
    } catch (error) {
      console.error('Failed to create quotation:', error);

      throw error;
    }
  }

  private async updateQuotation(
    quotationId: string,
    payload: IUpdateQuotationRequest,
  ): Promise<void> {
    try {
      const response = await this.quotationService.updateQuotation(
        payload,
        quotationId,
      );

      if (response.resultCode !== RESPONSE.SUCCESS) {
        throw new Error('Failed to update quotation');
      }

      await this.navigateBack();
    } catch (error) {
      console.error('Failed to update quotation:', error);

      throw error;
    }
  }

  private buildPayload(): ICreateQuotationRequest {
    const formValue = this.quotationForm.getRawValue();

    const items: IQuotationItemFormValue[] = formValue.items.map(
      (item: IQuotationItemFormValue) => {
        const payloadItem: IQuotationItemFormValue = {
          itemType: item.itemType,
          description: item.description ?? '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          remark: item.remark ?? '',
        };

        if (item.itemType === EQuotationItemType.PART) {
          payloadItem.productId = item.productId;

          payloadItem.sku = item.sku;
        }

        return payloadItem;
      },
    );

    return {
      workOrderId: this.workOrderId ?? formValue.workOrderId,
      validUntil: formValue.validUntil || undefined,
      includeVat: Boolean(formValue.includeVat),
      taxPercent: Number(formValue.taxPercent) || 0,
      discountAmount: Number(formValue.discountAmount) || 0,
      customerRemark: formValue.customerRemark || undefined,
      internalRemark: formValue.internalRemark || undefined,
      items,
    };
  }

  private formatDateForInput(value: string | Date | null | undefined): string {
    try {
      if (!value) {
        return '';
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, '0');

      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Failed to format date:', error);
      return '';
    }
  }

  private async navigateBack(): Promise<void> {
    try {
      await this.router.navigate(['/portal/repair/quotation']);
    } catch (error) {
      console.error('Failed to navigate:', error);
    }
  }
}
