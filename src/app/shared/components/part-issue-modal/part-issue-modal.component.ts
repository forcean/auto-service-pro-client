import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProducts } from '../../interface/product-list.interface';
import { IPartIssue, IQuotationPartAvailability, IWorkOrderTask } from '../../interface/repair-flow.interface';

type PartRequestMode = 'QUOTED' | 'COMPLIMENTARY' | 'CHARGED';

@Component({
  selector: 'app-part-issue-modal',
  standalone: false,
  templateUrl: './part-issue-modal.component.html',
  styleUrl: './part-issue-modal.component.scss',
})
export class PartIssueModalComponent {
  @Input() isOpen = false;
  @Input() task: IWorkOrderTask | null = null;
  @Input() mode: PartRequestMode = 'QUOTED';
  @Input() quotationParts: IQuotationPartAvailability[] = [];
  @Input() selectedQuotationPart: IQuotationPartAvailability | null = null;
  @Input() productResults: IProducts[] = [];
  @Input() selectedProduct: IProducts | null = null;
  @Input() productSearch = '';
  @Input() isLoadingQuotationParts = false;
  @Input() isSearchingProducts = false;
  @Input() isSubmitting = false;
  @Input() loadedIssue: IPartIssue | null = null;
  @Input() partForm: { requestedQty: number; remark: string } = { requestedQty: 1, remark: '' };

  @Output() close = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<PartRequestMode>();
  @Output() search = new EventEmitter<string>();
  @Output() productSelected = new EventEmitter<IProducts>();
  @Output() quotationPartSelected = new EventEmitter<IQuotationPartAvailability>();
  @Output() submitQuoted = new EventEmitter<void>();
  @Output() submitComplimentary = new EventEmitter<void>();
  @Output() submitCharged = new EventEmitter<void>();

  onSearch(): void {
    this.search.emit(this.productSearch.trim());
  }

  productUnitPrice(product: IProducts): number {
    return product.prices?.retail ?? product.prices?.wholesale ?? product.prices?.cost ?? 0;
  }

  onBackdropClick(): void {
    if (!this.isSubmitting) this.close.emit();
  }
}
