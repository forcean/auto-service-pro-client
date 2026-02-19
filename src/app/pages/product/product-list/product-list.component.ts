import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductList, IQueryListProduct } from '../../../shared/interface/product-list.interface';
import { StockManagementService } from '../../../shared/services/stock-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';


@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  private modalSubscription!: Subscription | null;
  form!: FormGroup;
  productList!: IProductList;
  filters: any = {};
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  @Input() headers: any[] = [];
  @Input() config!: any;
  @Input() totalRecord: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 1;
  @Input() sort: string = '';
  @Input() isLoading: boolean = false;
  @Input() isDisableAction: boolean = false;

  constructor(
    private router: Router,
    private stockManagementService: StockManagementService,
    private modalCommonService: ModalCommonService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      sortBy: ['latest']
    });

    this.form.get('sortBy')?.valueChanges.subscribe(() => {
      this.pageIndex = 1;
      this.loadProducts();
    });

    this.initializePermissions();
  }

  private async initializePermissions() {
    this.route.queryParams.subscribe(params => this.loadProducts());
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

  onFilterChange(filter: any) {
    console.log('filterChange', filter);
    this.filters = filter;
    this.loadProducts();
  }

  async loadProducts() {
    try {
      const params: IQueryListProduct = {
        page: 1,
        limit: 10,
      };

      const res = await this.stockManagementService.getListProduct(params);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.productList = res.resultData;
      } else {
        this.handleFailResponse()
      }
    } catch (error) {
      console.error(error);
      this.handleCommonError()
    }
  }

  onPageChange(e: any) {
    this.pageIndex = e.page;
    this.pageSize = e.limit;
    this.loadProducts();
  }

  onRoleChange() {
    this.pageIndex = 1; // reset หน้า
    this.loadProducts();
  }

  onClick(event: string) {
    this.router.navigate(['/portal/product/detail', event]);
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
