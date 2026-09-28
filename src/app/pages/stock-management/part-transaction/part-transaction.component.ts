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
import {
  ICreateStockReceiveRequest,
  IQueryStockMovement,
  IStockMovement,
  IStockMovementList,
  IStockMovementSummary,
} from '../../../shared/interface/stock-management.interface';
import { ITableHeaderStock } from '../../../shared/interface/table-stock-management.interface';
import { ReceiveStockModalService } from '../../../shared/components/receive-stock-modal/receive-stock-modal.service';

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
  search!: IQueryStockMovement;
  movementList!: IStockMovementList;
  summary: IStockMovementSummary = {
    total: 0,
    receive: 0,
    issue: 0,
    adjust: 0,
    return: 0,
    reserve: 0,
    release: 0,
    in: 0,
    out: 0,
  };
  isLoading = false;
  isLoadingSummary = false;
  selectedMovement: IStockMovement | null = null;
  headers: ITableHeaderStock[] = [
    {
      headerName: 'createdAt',
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
      headerName: 'referenceId',
      valueType: 'string',
      isSort: true,
      i18nKey: 'เลขที่เอกสาร',
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
    {
      headerName: 'action',
      valueType: 'string',
      isSort: false,
      i18nKey: 'จัดการ',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly stockManagementService: StockManagementService,
    private readonly loadingBarService: LoadingBarService,
    private readonly receiveStockModalService: ReceiveStockModalService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.updateQueryParams(params);
    });
  }

  onSearch(criteria: IQueryStockMovement): void {
    this.page = 1;
    this.search = {
      ...criteria,
      page: this.page,
      limit: this.limit,
    };
    this.updateUrlParams();
  }

  onKeyword(keyword: string): void {
    this.keyword = keyword;
    this.page = 1;
    this.updateUrlParams();
  }

  onSort(sort: string[]): void {
    this.sort = sort.join(',');
    this.page = 1;
    this.updateUrlParams();
  }

  onChangePage(event: any): void {
    this.page = event.page;
    this.limit = event.pageSize;
    this.updateUrlParams();
  }

  openMovementDetail(movement: IStockMovement): void {
    this.selectedMovement = movement;
  }

  closeMovementDetail(): void {
    this.selectedMovement = null;
  }

  movementLabel(type: string): string {
    return {
      RECEIVE: 'รับเข้า',
      ISSUE: 'เบิกออก',
      RETURN: 'คืนสินค้า',
      ADJUST: 'ปรับสต๊อก',
      RESERVE: 'สำรองสินค้า',
      RELEASE: 'ปลดสำรอง',
      TRANSFER_IN: 'รับโอน',
      TRANSFER_OUT: 'โอนออก',
    }[type] ?? type;
  }

  movementTone(type: string): string {
    return {
      RECEIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      RETURN: 'bg-sky-50 text-sky-700 ring-sky-200',
      ISSUE: 'bg-rose-50 text-rose-700 ring-rose-200',
      ADJUST: 'bg-amber-50 text-amber-700 ring-amber-200',
      RESERVE: 'bg-violet-50 text-violet-700 ring-violet-200',
      RELEASE: 'bg-slate-100 text-slate-700 ring-slate-200',
      TRANSFER_IN: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
      TRANSFER_OUT: 'bg-orange-50 text-orange-700 ring-orange-200',
    }[type] ?? 'bg-slate-100 text-slate-700 ring-slate-200';
  }

  directionTone(direction: string): string {
    return direction === 'IN'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : direction === 'OUT'
        ? 'bg-rose-50 text-rose-700 ring-rose-200'
        : 'bg-amber-50 text-amber-700 ring-amber-200';
  }

  quantityChange(movement: IStockMovement): number {
    return movement.afterQty - movement.beforeQty;
  }

  onReset(): void {
    this.keyword = '';
    this.sort = '';
    this.page = 1;
    this.search = {
      page: this.page,
      limit: this.limit,
    };
    this.updateUrlParams();
  }

  navigateToPartIssueQueue(): void {
    void this.router.navigate(['/portal/stock/part-issues']);
  }

  private updateQueryParams(params: any): void {
    this.keyword = params['keyword'] ?? '';
    this.page = this.readPositiveNumber(params['page'], 1);
    this.limit = this.readPositiveNumber(params['limit'], 20);
    this.sort = params['sort'] ?? '';
    this.search = {
      movementType: params['movementType'],
      warehouseId: params['warehouseId'],
      referenceType: params['referenceType'],
      referenceId: params['referenceId'],
      startDate: params['startDate'],
      endDate: params['endDate'],
      createdBy: params['createdBy'],
      sku: params['sku'],
      page: this.page,
      limit: this.limit,
    };
    this.getMovementSummary();
    this.getMovementList();
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword || null,
        sku: this.search.sku || null,
        movementType: this.search.movementType || null,
        warehouseId: this.search.warehouseId || null,
        referenceType: this.search.referenceType || null,
        referenceId: this.search.referenceId || null,
        startDate: this.search.startDate || null,
        endDate: this.search.endDate || null,
        createdBy: this.search.createdBy || null,
        page: this.page,
        limit: this.limit,
        sort: this.sort || null,
      },
    });
  }

  private async getMovementList(): Promise<void> {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const params: IQueryStockMovement = {
        keyword: this.keyword || undefined,
        movementType: this.search.movementType,
        warehouseId: this.search.warehouseId,
        referenceType: this.search.referenceType,
        referenceId: this.search.referenceId,
        startDate: this.search.startDate,
        endDate: this.search.endDate,
        createdBy: this.search.createdBy,
        sku: this.search.sku,
        page: this.page,
        limit: this.limit,
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

  async getMovementSummary(): Promise<void> {
    this.isLoadingSummary = true;
    // const loader = this.loadingBarService.useRef();
    // loader.start();
    try {
      const res = await this.stockManagementService.getMovementSummary();
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.summary = res.resultData;
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error(error);
      this.handleFailResponse();
    } finally {
      this.isLoadingSummary = false;
      // loader.complete();
    }
  }

  private handleFailResponse(): void {
    console.error('Cannot load stock movement');
  }

  openReceiveStockModal(): void {
    this.receiveStockModalService.open({
      title: 'รับสินค้าเข้าคลัง',
    });
  }

  async onReceiveStock(event: {
    productId: string;
    body: ICreateStockReceiveRequest;
  }): Promise<void> {
    try {
      const res = await this.stockManagementService.createStockReceive(
        event.productId,
        event.body,
      );
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.receiveStockModalService.close();
        this.getMovementSummary();
        this.getMovementList();
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error(error);
      this.handleFailResponse();
    } finally {
    }
  }

  private readPositiveNumber(value: unknown, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }
}
