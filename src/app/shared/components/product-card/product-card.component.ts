import { Component, EventEmitter, Input, Output } from '@angular/core';
export interface IProductCard {
  _id: string;
  sku: string;
  name: string;
  brandName: string;
  categoryName: string;

  price: {
    retail: number;
    wholesale?: number;
  };

  image?: string;
  status: 'active' | 'out_of_stock' | 'inactive';

  vehicles?: string[]; // เช่น ["Golf Mk7", "Passat B8"]
}

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: IProductCard;
  @Output() clicked = new EventEmitter<string>();

  onClick() {
    this.clicked.emit(this.product._id);
  }

  get isOutOfStock() {
    return this.product.status !== 'active';
  }
}
