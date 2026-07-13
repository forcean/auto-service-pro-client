import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PermissionService } from '../../../shared/services/permission.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { Subscription } from 'rxjs';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { StockManagementService } from '../../../shared/services/stock-management.service';
import { IQueryStockMovement, IStockMovementList, IStockMovementSummary } from '../../../shared/interface/stock-management.interface';
import { ITableHeaderStock } from '../../../shared/interface/table-stock-management.interface';

@Component({
  selector: 'app-part-transaction',
  standalone: false,
  templateUrl: './part-transaction.component.html',
  styleUrl: './part-transaction.component.scss',
})
export class PartTransactionComponent implements OnInit {
  @ViewChild(ModalConditionComponent)
  modalConditionComponent!: ModalConditionComponent;
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;

  keyword = '';
  page = 1;
  limit = 20;
  sort = '';
  search!: IQueryStockMovement
  movementList!: IStockMovementList;
  summary: IStockMovementSummary={
      total: 50,
      receive: 8,
      issue: 2,
      adjust: 5,
      return: 17,
      reserve:20,
      release: 10
  };
  isLoading = false;
  headers: ITableHeaderStock[] = [
    {
      headerName: 'transactionDate',
      valueType: 'date',
      isSort: true,
      i18nKey: 'วันที่',
    },
    {
      headerName: 'movementType',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ประเภท',
    },
    {
      headerName: 'direction',
      valueType: 'string',
      isSort: false,
      i18nKey: 'ทิศทาง',
    },
    {
      headerName: 'sku',
      valueType: 'string',
      isSort: true,
      i18nKey: 'SKU',
    },
    {
      headerName: 'productId',
      valueType: 'string',
      isSort: true,
      i18nKey: 'สินค้า',
    },
    {
      headerName: 'quantity',
      valueType: 'number',
      isSort: true,
      i18nKey: 'จำนวน',
    },
    {
      headerName: 'afterQty',
      valueType: 'number',
      isSort: true,
      i18nKey: 'คงเหลือ',
    },
    {
      headerName: 'createdBy',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ผู้บันทึก',
    },
    { headerName: 'action', valueType: 'string', isSort: false, i18nKey: 'จัดการ' },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly stockManagementService: StockManagementService,
    private readonly loadingBarService: LoadingBarService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.updateQueryParams(params);
    });
  }

  onSearch(criteria: IQueryStockMovement): void {
    this.search = criteria;
    this.page = 1;
    this.updateUrlParams();
  }

  onKeyword(keyword: string): void {
    this.keyword = keyword;
    this.page = 1;
    this.updateUrlParams();
  }

  onSort(sort: string[]): void {
    this.sort = sort.join(',');
    this.updateUrlParams();
  }

  onChangePage(event: any): void {
    this.page = event.page;
    this.limit = event.pageSize;
    this.updateUrlParams();
  }

  onReset(): void {
    this.keyword = '';
    this.sort = '';
    this.page = 1;
    this.search = {
      page: this.page,
      limit: this.limit
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: null,
        movementType: null,
        warehouseId: null,
        referenceType: null,
        startDate: null,
        endDate: null,
        createdBy: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  private updateQueryParams(params: any): void {
    this.keyword = params['keyword'] ?? '';
    this.page = Number(params['page'] ?? 1);
    this.limit = Number(params['limit'] ?? 20);
    this.sort = params['sort'] ?? '';
    this.search = {
      movementType: params['movementType'],
      warehouseId: params['warehouseId'],
      referenceType: params['referenceType'],
      startDate: params['startDate'],
      endDate: params['endDate'],
      createdBy: params['createdBy'],
      page: this.page,
      limit: this.limit,
    };
    this.getMovementList();
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword || undefined,
        movementType: this.search.movementType || undefined,
        warehouseId: this.search.warehouseId || undefined,
        referenceType: this.search.referenceType || undefined,
        startDate: this.search.startDate || undefined,
        endDate: this.search.endDate || undefined,
        createdBy: this.search.createdBy || undefined,
        page: this.page,
        limit: this.limit,
        sort: this.sort || undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  private async getMovementList(): Promise<void> {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const params: any = {
        keyword: this.keyword || undefined,
        movementType: this.search.movementType,
        warehouseId: this.search.warehouseId,
        referenceType: this.search.referenceType,
        startDate: this.search.startDate,
        endDate: this.search.endDate,
        createdBy: this.search.createdBy,
        // page: this.page,
        // limit: this.limit,
        sort: this.sort || undefined,
      };
      const res = await this.stockManagementService.getStockList(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.movementList = res.resultData;
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error(error);
      this.handleFailResponse();
    } finally {
      this.isLoading = false;
      loader.complete();
    }
  }

  private handleFailResponse(): void {
    console.error('Cannot load stock movement');
  }
}
