import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-product-filter',
  standalone: false,
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.scss'
})
export class ProductFilterComponent {
  @Output() filterChange = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      search: [''],
      categoryId: [null],
      brandId: [null],

      vehicleBrandId: [null],
      vehicleModelId: [null],
      year: [null],
      engine: [null],

      inStock: [true],
    });

    this.form.valueChanges.subscribe(value => {
      this.filterChange.emit(value);
    });
  }
}