import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IQueryStockMovement } from '../../interface/stock-management.interface';

@Component({
  selector: 'app-stock-search',
  standalone: false,
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.scss'
})
export class StockSearchComponent implements OnInit {

  @Output()search = new EventEmitter<IQueryStockMovement>();
  @Output()reset = new EventEmitter<void>();

  searchForm!: FormGroup;
  products: any[] = [];
  users: any[] = [];

  constructor(
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      movementType: [''],
      direction: [''],
      sku: [''],
      startDate: [''],
      endDate: [''],
      reference: [''],
      createdBy: ['']
    });
  }

  onSubmit(): void {
    this.search.emit(this.searchForm.getRawValue());
  }

  onReset(): void {
    this.searchForm.reset({
      keyword: '',
      movementType: '',
      direction: '',
      sku: '',
      startDate: '',
      endDate: '',
      reference: '',
      createdBy: ''
    });
    this.reset.emit();
  }
}