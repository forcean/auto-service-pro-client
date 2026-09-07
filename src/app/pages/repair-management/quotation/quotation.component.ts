import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EQuotationStatus,
  IQuotationListItem,
} from '../../../shared/interface/quotation.interface';
import {
  ITableHeaderQuotation,
  IQuotationResultData,
  ISearchQuotationCriteria,
  IQueryListQuotation,
} from '../../../shared/interface/table-quotation.interface';
import { PaginationModel } from '../../../shared/interface/pagination.model';
import { WorkOrderService } from '../../../shared/services/work-order.service';
import {
  IWorkOrder,
  IWorkOrderQuery,
} from '../../../shared/interface/work-order.interface';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { PermissionService } from '../../../shared/services/permission.service';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { QuotationService } from '../../../shared/services/quotation.service';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';

interface IQuotationDashboardSummary {
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  unquotedWorkOrderCount: number;
  totalApprovedValue: number;
}

@Component({
  selector: 'app-quotation',
  standalone: false,
  templateUrl: './quotation.component.html',
  styleUrl: './quotation.component.scss',
})
export class QuotationComponent implements OnInit {
  @ViewChild(ModalConditionComponent)
  modalConditionComponent!: ModalConditionComponent;
  quotationId!: string;
  quotationResultData!: IQuotationResultData;
  private modalSubscription: Subscription | null = null;
  summary: IQuotationDashboardSummary = {
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    unquotedWorkOrderCount: 0,
    totalApprovedValue: 0,
  };

  unquotedWorkOrders: IWorkOrder[] = [];
  // Pagination & Filter Parameters
  page: number = 1;
  limit: number = 10;
  searchKeyword = '';
  sortList: string = '';
  selectedStatus!: EQuotationStatus;
  EQuotationStatus = EQuotationStatus;
  isUnquotedPanelOpen = true;
  isLoading = false;
  isLoadingDelete: boolean = false;

  // Permissions
  permissions!: PermissionService;
  isRoleSO: boolean = false;
  isRoleAMD: boolean = false;
  isRoleMNG: boolean = false;
  isPasswordInvalid: boolean = false;
  isResetPassword: boolean = false;
  isViewUserList: boolean = false;

  headers: ITableHeaderQuotation[] = [
    {
      headerName: 'quotationNo',
      valueType: 'string',
      isSort: true,
      i18nKey: 'เลขที่ใบเสนอราคา',
    },
    {
      headerName: 'workOrderNo',
      valueType: 'string',
      isSort: true,
      i18nKey: 'Work Order',
    },
    {
      headerName: 'version',
      valueType: 'number',
      isSort: true,
      i18nKey: 'เวอร์ชัน',
    },
    {
      headerName: 'grandTotal',
      valueType: 'number',
      isSort: true,
      i18nKey: 'ยอดสุทธิ (บาท)',
    },
    {
      headerName: 'status',
      valueType: 'string',
      isSort: true,
      i18nKey: 'สถานะ',
    },
    {
      headerName: 'createdAt',
      valueType: 'date',
      isSort: true,
      i18nKey: 'วันที่สร้าง',
    },
    {
      headerName: 'actions',
      valueType: 'actions',
      isSort: false,
      i18nKey: 'การจัดการ',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private workOrderService: WorkOrderService,
    private quotationService: QuotationService,
    private permissionService: PermissionService,
    private modalCommonService: ModalCommonService,
    private loadingBarService: LoadingBarService,
    private modalConditionService: ModalConditionService,
  ) {}

  ngOnInit(): void {
    this.initializePermissions();
  }

  private async initializePermissions() {
    try {
      // this.permissions = await this.permissionService.permissions();
      // this.isViewUserList = this.permissionService.isViewUserList;
      // this.isResetPassword = this.permissionService.isResetPassword;
      // if (!this.isViewUserList) {
      //   this.router.navigate(['/not-found']);
      // } else {
      this.route.queryParams.subscribe((params) =>
        this.updateQueryParams(params),
      );
      // }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    }
  }

  async fetchQuotations(): Promise<void> {
    this.isLoading = true;
    try {
      const params: IQueryListQuotation = {
        page: this.page,
        limit: this.limit,
        sort: this.sortList || undefined,
        status: this.selectedStatus || undefined,
        keyword: this.searchKeyword || undefined,
      };
      const res = await this.quotationService.getListQuotation(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.quotationResultData = res.resultData;
        this.calculateSummary();
      } else {
        this.quotationResultData = res.resultData;
        this.calculateSummary();
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  async fetchUnquotedWorkOrders(): Promise<void> {
    try {
      const params: IWorkOrderQuery = {
        page: 1,
        limit: 20,
        // status: EWorkOrderStatus.OPEN,
      };
      const res = await this.workOrderService.getListWorkOrder(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.unquotedWorkOrders = res.resultData.data;
        this.calculateSummary();
      } else {
        this.unquotedWorkOrders = res.resultData.data;
        this.calculateSummary();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteQuotation(id: string) {
    this.isLoadingDelete = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      this.modalConditionComponent.onClose();
      const res = await this.quotationService.deleteQuotation(id);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleSuccessDelete();
        this.router.navigate(['/portal/repair/quotation']);
      } else {
        this.handleFailDelete();
      }
    } catch (error) {
      console.error('Response error', error);
      this.handleCommonError();
    } finally {
      this.isLoadingDelete = false;
      loader.complete();
    }
  }

  private updateQueryParams(params: any) {
    this.page = Number(params['page'] || this.page);
    this.limit = Number(params['limit'] || this.limit);
    this.sortList = params['sort'] || '';
    this.selectedStatus = params['status'] || '';
    this.fetchQuotations();
    this.fetchUnquotedWorkOrders();
  }

  private calculateSummary(): void {
    const list = this.quotationResultData.data;
    const totalCount = list.length;
    const pendingCount = list.filter(
      (q) => q.status === EQuotationStatus.PENDING_APPROVAL,
    ).length;
    const approvedQuotations = list.filter(
      (q) => q.status === EQuotationStatus.APPROVED,
    );
    const approvedCount = approvedQuotations.length;
    const totalApprovedValue = approvedQuotations.reduce(
      (sum, q) => sum + q.grandTotal,
      0,
    );

    this.summary = {
      totalCount,
      pendingCount,
      approvedCount,
      unquotedWorkOrderCount: this.unquotedWorkOrders.length,
      totalApprovedValue,
    };
  }

  toggleUnquotedPanel(): void {
    this.isUnquotedPanelOpen = !this.isUnquotedPanelOpen;
  }

  onSearch(): void {
    this.page = 1;
    this.updateUrlParams();
  }

  onStatusFilterChange(status: EQuotationStatus): void {
    this.selectedStatus = status;
    this.page = 1;
    this.limit = 10;
    this.updateUrlParams();
  }

  onResetCriteria(): void {
    this.searchKeyword = '';
    // this.selectedStatus = EQuotationStatus.ALL;
    this.page = 1;
    this.limit = 10;
    this.sortList = '';

    this.updateUrlParams();
  }

  onSort(event: string[]) {
    this.sortList = event.join(',');
    this.updateUrlParams();
  }

  onChangePage(event: PaginationModel): void {
    this.page = event.page;
    this.limit = event.pageSize;
    this.fetchQuotations();
  }

  private updateUrlParams() {
    const queryParams = {
      page: this.page.toString(),
      limit: this.limit.toString(),
      sort: this.sortList || undefined,
      status: this.selectedStatus || undefined,
      search: this.searchKeyword || undefined,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  goToCreate(workOrderNo?: string): void {
    if (workOrderNo) {
      this.router.navigate(['portal/repair/quotation/create'], {
        queryParams: { workOrderNo },
      });
    } else {
      this.handleCommonError();
    }
  }

  viewDetail(id: string): void {
    this.router.navigate(['portal/repair/quotation', id]);
  }

  onEditQuotation(id: string): void {
    this.router.navigate(['portal/repair/quotation/create'], {
      queryParams: { id },
    });
  }

  onDeleteQuotation(_id: string): void {
    this.quotationId = _id;
    this.handleModalDelete();
  }

  handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.deleteQuotation(this.quotationId);
    }
  }

  private handleModalDelete() {
    this.modalConditionService.open({
      type: 'change',
      title: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
      subtitle:
        'หากคุณยืนยัน ระบบจะทำการลบผู้ใช้นี้ออกจากระบบ และไม่สามารถกู้คืนได้ คลิก "ยืนยัน" เพื่อดำเนินการต่อ หรือคลิก "ยกเลิก" เพื่อออกจากหน้าต่างนี้.',
    });
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/landing']);
        this.unsubscribeModal();
      }
    });
  }

  private handleFailDelete() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ไม่สามารถลบใบเสนอราคาได้',
      subtitle:
        'ไม่สามารถลบใบเสนอราคาได้ โปรดลองอีกครั้งหรือติดต่อ<br>ผู้ดูแลระบบหากปัญหายังคงอยู่',
      buttonText: 'ยืนยัน',
    });
  }

  private handleSuccessDelete() {
    this.modalCommonService.open({
      type: 'success',
      title: 'ลบใบเสนอราคาสำเร็จ',
      subtitle: 'ใบเสนอราคานี้ถูกลบออกจากระบบเรียบร้อยแล้ว.',
      buttonText: 'เข้าใจแล้ว',
    });
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }
}
