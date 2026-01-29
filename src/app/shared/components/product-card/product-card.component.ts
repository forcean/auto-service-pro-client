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

  get isOutOfStock() {
    return this.product.status !== 'active';
  }
}
