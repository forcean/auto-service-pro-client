import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  IProductFilterState,
  IProductList,
  IQueryListProduct,
  ISearchProducts,
} from '../../../shared/interface/product-list.interface';
import { ProductService } from '../../../shared/services/product.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { PaginationModel } from '../../../shared/interface/pagination.model';


@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {
  private modalSubscription!: Subscription | null;
  private routeSubscription?: Subscription;
  private sortSubscription?: Subscription;
  private latestLoadId = 0;
  form!: FormGroup;
  productList: IProductList = {
    page: 1,
    limit: 10,
    total: 0,
    totalPage: 0,
    products: [],
  };
  filters: ISearchProducts = {};
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  totalRecord = 0;
  pageSize = 10;
  pageIndex = 1;
  sort = 'latest';
  isLoading = false;
  errorMessage = '';
  categorySlug?: string;
  brandCode?: string;

  constructor(
    private router: Router,
    private productService: ProductService,
    private modalCommonService: ModalCommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      sortBy: ['latest']
    });

    this.sortSubscription = this.form.get('sortBy')?.valueChanges.subscribe((sort: string) => {
      this.sort = sort || 'latest';
      this.pageIndex = 1;
      this.updateUrlFromState();
    });

    this.initializePermissions();
  }

  private initializePermissions(): void {
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      this.applyStateFromUrl(params);
      this.loadProducts();
    });
    // try {
    //   this.permissions = await this.permissionService.permissions();
    //   this.isViewDetailReport = this.permissionService.isViewDetailReport;
    // this.isDeleteUser=this.permissionService.isDeleteUser;
    // this.isUpdateUser=this.permissionService.isUpdateUser;
    // this.isResetPasswordUser=this.permissionService.isResetPasswordUser;
    //   if (!this.isViewDetailReport) {
    //     this.router.navigate(['/not-found']);
    //   } else {
    //     this.route.queryParams.subscribe(params => this.updateQueryParams(params));
    //   }
    // } catch (error) {
    //   const errorObject = error as { message: string };
    //   if (errorObject.message !== '504') {
    //     this.handleCommonError();
    //   }
    // }
  }

  onFilterChange(filterState: IProductFilterState): void {
    this.filters = { ...filterState.filters };
    this.categorySlug = filterState.categorySlug;
    this.brandCode = filterState.brandCode;
    this.pageIndex = 1;
    this.updateUrlFromState();
  }

  onAddProduct() {
    this.router.navigate(['/portal/product/create']);
  }

  async loadProducts() {
    const loadId = ++this.latestLoadId;
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const params: IQueryListProduct = {
        ...this.filters,
        page: this.pageIndex,
        limit: this.pageSize,
        sort: this.getSortQuery(this.sort),
      };

      const res = await this.productService.getListProduct(params);
      if (loadId !== this.latestLoadId) return;

      if (res.resultCode == RESPONSE.SUCCESS) {
        this.productList = res.resultData;
        this.totalRecord = res.resultData.total || 0;

        // A filter can leave the user on a page that no longer exists.
        if (res.resultData.totalPage > 0 && this.pageIndex > res.resultData.totalPage) {
          this.pageIndex = res.resultData.totalPage;
          this.updateUrlFromState();
          return;
        }
      } else {
        this.errorMessage = res.error?.message || 'ไม่สามารถโหลดรายการสินค้าได้';
      }
    } catch (error) {
      if (loadId !== this.latestLoadId) return;
      console.error(error);
      this.errorMessage = 'ไม่สามารถเชื่อมต่อข้อมูลสินค้าได้';
    } finally {
      if (loadId === this.latestLoadId) {
        this.isLoading = false;
      }
    }
  }

  onPageChange({ page, pageSize }: PaginationModel): void {
    this.pageIndex = page;
    this.pageSize = pageSize;
    this.updateUrlFromState();
  }

  trackByProduct(index: number, product: { id: string; sku: string }): string {
    return product.id || product.sku || `product-${index}`;
  }

  onClick(productId: string): void {
    const product = this.productList.products.find((item) => item.id === productId);
    const identifier = product?.sku || productId;
    this.router.navigate(['/portal/product/detail', identifier], {
      queryParams: this.buildQueryParams(),
    });
  }

  retry(): void {
    this.loadProducts();
  }

  private applyStateFromUrl(params: Params): void {
    const categorySlug = this.queryText(params['category']);
    const brandCode = this.queryText(params['brand']);
    const categoryId = this.queryText(params['categoryId']) ??
      (categorySlug === this.categorySlug ? this.filters.categoryId : undefined);
    const brandId = this.queryText(params['brandId']) ??
      (brandCode === this.brandCode ? this.filters.brandId : undefined);

    this.filters = {
      sku: this.queryText(params['sku']),
      categoryId,
      brandId,
      isStocked: params['isStocked'] === 'true' ? true : undefined,
    };
    this.categorySlug = categorySlug;
    this.brandCode = brandCode;
    this.pageIndex = this.queryNumber(params['page'], 1);
    this.pageSize = this.paginationOption.includes(Number(params['limit']))
      ? Number(params['limit'])
      : 10;
    this.sort = this.isValidSort(params['sort']) ? params['sort'] : 'latest';

    this.form.patchValue({ sortBy: this.sort }, { emitEvent: false });
  }

  private updateUrlFromState(): void {
    if (this.isCurrentUrlState()) {
      // A readable URL (for example brand=DENSO) can resolve to an internal ID
      // after the filter options finish loading without changing the URL.
      this.loadProducts();
      return;
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.buildQueryParams(),
      replaceUrl: true,
    });
  }

  private isCurrentUrlState(): boolean {
    const target = this.buildQueryParams();
    const current = this.route.snapshot.queryParams;
    const keys = new Set([...Object.keys(target), ...Object.keys(current)]);

    return [...keys].every((key) => {
      const targetValue = target[key];
      const currentValue = current[key];

      if (targetValue === null || targetValue === undefined) {
        return currentValue === null || currentValue === undefined;
      }

      return String(targetValue) === String(currentValue);
    });
  }

  private buildQueryParams(): Params {
    return {
      sku: this.filters.sku || null,
      category: this.categorySlug || null,
      brand: this.brandCode || null,
      isStocked: this.filters.isStocked ? 'true' : null,
      page: this.pageIndex > 1 ? this.pageIndex : null,
      limit: this.pageSize !== 10 ? this.pageSize : null,
      sort: this.sort !== 'latest' ? this.sort : null,
    };
  }

  private queryText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private queryNumber(value: unknown, fallback: number): number {
    const numberValue = Number(value);
    return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback;
  }

  private isValidSort(value: unknown): value is string {
    return ['latest', 'name_asc', 'name_desc', 'brand_asc', 'stock_desc'].includes(
      String(value),
    );
  }

  private getSortQuery(sort: string): string {
    if (sort === 'name_asc') {
      return 'name.asc';
    }

    if (sort === 'name_desc') {
      return 'name.desc';
    }

    if (sort === 'brand_asc') {
      return 'brandId.asc';
    }

    if (sort === 'stock_desc') {
      return 'isStocked.desc';
    }

    return 'createdDt.desc';
  }

  ngOnDestroy(): void {
    ++this.latestLoadId;
    this.modalSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.sortSubscription?.unsubscribe();
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/landing']);
        this.unsubscribeModal();
      }
    });
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });
  }
}
