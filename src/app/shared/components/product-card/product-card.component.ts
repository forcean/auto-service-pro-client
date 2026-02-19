import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IProducts } from '../../interface/product-list.interface';
@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: IProducts;
  @Output() clicked = new EventEmitter<string>();

  onClick() {
    this.clicked.emit(this.product.id);
  }

  get primaryImageUrl(): string | null {
    if (!this.product.images?.length) return null;

    const primary = this.product.images.find(i => i.isPrimary);
    return primary?.url || this.product.images[0]?.url || null;
  }

  get statusLabel(): string {
    switch (this.product.status) {
      case 'active':
        return '';
      case 'out_of_stock':
        return 'Out of stock';
      case 'inactive':
        return 'Inactive';
      case 'discontinued':
        return 'Discontinued';
      default:
        return '';
    }
  }
  get statusText(): string {
    switch (this.product.status) {
      case 'active':
        return '';
      case 'out_of_stock':
        return 'สินค้าหมด';
      case 'inactive':
        return 'ไม่ใช้งาน';
      case 'discontinued':
        return 'เลิกผลิต';
      default:
        return '';
    }
  }

  get badgeClass(): string {
    return this.product.status;
  }

  get vehicleNames(): string | null {
    if (!this.product.vehicles?.length) return null;
    return this.product.vehicles.map(v => v.model).join(', ');
  }

  get hasPrice(): boolean {
    return !!this.product.prices;
  }
}