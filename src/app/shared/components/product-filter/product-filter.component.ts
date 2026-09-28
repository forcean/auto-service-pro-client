import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  IProductFilterState,
  ISearchProducts,
} from '../../interface/product-list.interface';
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
export class ProductFilterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() loading: boolean = false;
  @Input() initialFilters: ISearchProducts = {};
  @Input() initialCategorySlug?: string;
  @Input() initialBrandCode?: string;
  @Output() onSearchChange = new EventEmitter<IProductFilterState>();

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
    this.applyInitialFilters();
    await this.loadCategories();
    this.applyInitialFilters();
    await this.loadBrands();
    this.applyInitialFilters();
    this.bindFormChange();
    this.emitSearch();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['initialFilters'] ||
        changes['initialCategorySlug'] ||
        changes['initialBrandCode']) &&
      this.form
    ) {
      this.applyInitialFilters();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      search: [''],
      categoryId: [null],
      brandId: [null],

      inStock: [false],
    });
  }

  private applyInitialFilters(): void {
    const categoryId =
      this.initialFilters.categoryId ??
      this.findCategoryBySlug(this.categories, this.initialCategorySlug)?.id ??
      null;
    const brandId =
      this.initialFilters.brandId ??
      this.brands.find((brand) => brand.code === this.initialBrandCode)?.id ??
      null;

    this.form.patchValue(
      {
        search: this.initialFilters.sku ?? '',
        categoryId,
        brandId,
        inStock: this.initialFilters.isStocked === true,
      },
      { emitEvent: false },
    );
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

    const filters: ISearchProducts = {
      sku: raw.search?.trim() || undefined,
      categoryId: raw.categoryId || undefined,
      brandId: raw.brandId || undefined,

      // A false value means "all products". Sending it to the API would instead
      // filter for products whose stock flag is false.
      isStocked: raw.inStock ? true : undefined,
    };
    const category = this.findCategoryById(this.categories, filters.categoryId);
    const brand = this.brands.find((item) => item.id === filters.brandId);

    this.onSearchChange.emit({
      filters,
      categorySlug: category?.slug,
      brandCode: brand?.code,
    });
  }

  reset(): void {
    this.form.reset(
      { inStock: false },
      { emitEvent: false }
    );
    this.emitSearch();
  }

  private async loadCategories(): Promise<void> {
    try {
      const params: IQueryCatalogProducts = {
        isActive: true,
        // isSelectable: true
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

  private findCategoryById(
    categories: ICategory[],
    categoryId?: string,
  ): ICategory | undefined {
    for (const category of categories) {
      if (category.id === categoryId) return category;

      const child = this.findCategoryById(category.children ?? [], categoryId);
      if (child) return child;
    }

    return undefined;
  }

  private findCategoryBySlug(
    categories: ICategory[],
    slug?: string,
  ): ICategory | undefined {
    for (const category of categories) {
      if (category.slug === slug) return category;

      const child = this.findCategoryBySlug(category.children ?? [], slug);
      if (child) return child;
    }

    return undefined;
  }
}
