import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ProductBrand } from '../../interface/brand.interface';

@Component({
  selector: 'app-custom-brand-option',
  standalone: false,
  templateUrl: './custom-brand-option.component.html',
  styleUrl: './custom-brand-option.component.scss'
})
export class CustomBrandOptionComponent {

  @Input({ required: true }) brand!: ProductBrand;
  @Input() value!: string;
  @Input() label!: string;

  isSelected = false;

  @Output() selectEvent = new EventEmitter<{ value: string; label: string }>();

  ngOnInit() {
    this.value = this.value ?? this.brand.id;
    this.label = this.label ?? this.brand.name;
  }

  getValue() {
    return this.value;
  }

  getLabel() {
    return this.label;
  }

  @HostListener('click')
  onSelect() {
    this.selectEvent.emit({
      value: this.value,
      label: this.label
    });
  }
}

