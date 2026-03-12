import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISearchProducts } from '../../interface/product-list.interface';
import { debounceTime, skip, Subscription } from 'rxjs';
import { ICategory, IProductBrand, IQueryCatalogProducts } from '../../interface/catalog.interface';
import { CatalogService } from '../../services/catalog.service';
import { RESPONSE } from '../../enum/response.enum';

@Component({
  selector: 'app-product-filter',
  standalone: false,
  templateUrl: './product-filter.component.html',
  styleUrl: './product-filter.component.scss'
})
export class ProductFilterComponent implements OnInit, OnDestroy {
  @Input() loading: boolean = false;
  @Output() onSearchChange = new EventEmitter<ISearchProducts>();

  form!: FormGroup;
  categories: ICategory[] = [];
  brands: IProductBrand[] = [];

  private formSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService
  ) { }

  async ngOnInit(): Promise<void> {
    this.initForm();
    await this.loadCategories();
    await this.loadBrands();
    this.bindFormChange();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  private initForm(): void {
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
  }

  private bindFormChange(): void {
    this.formSubscription = this.form.valueChanges
      .pipe(
        debounceTime(400)
      )
      .subscribe(() => {
        this.emitSearch();
      });
  }

  private emitSearch(): void {
    const raw = this.form.value;

    const data: ISearchProducts = {
      keyword: raw.search?.trim() || undefined,
      categoryId: raw.categoryId || undefined,
      brandId: raw.brandId || undefined,

      vehicleBrandId: raw.vehicleBrandId || undefined,
      vehicleModelId: raw.vehicleModelId || undefined,
      year: raw.year || undefined,
      engine: raw.engine || undefined,

      inStock: raw.inStock
    };
    this.onSearchChange.emit(data);
  }

  reset(): void {
    this.form.reset(
      { inStock: true },
      { emitEvent: false }
    );
    this.emitSearch();
  }

  private async loadCategories(): Promise<void> {
    try {
      const params: IQueryCatalogProducts = {
        isActive: true,
        isSelectable: true
      };
      const res = await this.catalogService.getCategories(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.categories = res.resultData.categories;
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async loadBrands(): Promise<void> {
    try {
      const params: IQueryCatalogProducts = {
        isActive: true
      };
      const res = await this.catalogService.getBrands(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.brands = res.resultData.brands;
      }
    } catch (error) {
      console.error(error);
    }
  }
}