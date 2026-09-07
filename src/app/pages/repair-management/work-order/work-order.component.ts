import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { CreateWorkOrderModalComponent } from '../../../shared/components/create-work-order-modal/create-work-order-modal.component';
import {
  LucideAngularModule,
  ClipboardList,
  Search,
  Plus,
  FileText,
  Clock,
  Wrench,
  ShieldCheck,
  Car,
  CheckCircle,
  X,
} from 'lucide-angular';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IWorkOrder,
  IWorkOrderResult,
} from '../../../shared/interface/work-order.interface';
import { WorkOrderService } from '../../../shared/services/work-order.service';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { WORK_ORDER_STATUS_CONFIG } from '../../../shared/constant/work-order-status.constant';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-work-order',
  standalone: false,
  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.scss',
})
export class WorkOrderComponent implements OnInit, OnDestroy {
  // @ViewChild(CreateWorkOrderModalComponent)
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  page: number = 1;
  limit: number = 10;
  sortList: string = '';
  createModal?: CreateWorkOrderModalComponent;
  workOrders!: IWorkOrderResult;

  // Lucide Icons
  readonly ClipboardListIcon = ClipboardList;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly FileTextIcon = FileText;
  readonly ClockIcon = Clock;
  readonly WrenchIcon = Wrench;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly CarIcon = Car;
  readonly CheckCircleIcon = CheckCircle;
  readonly XIcon = X;
  readonly EWorkOrderStatus = EWorkOrderStatus;

  // Filter States
  searchQuery = '';
  selectedStatus: EWorkOrderStatus = EWorkOrderStatus.ALL;
  selectedDate = '';

  // Modal State

  statusCounts = {
    all: 0,
    pending: 0,
    inProgress: 0,
    qualityCheck: 0,
    waitingParts: 0,
    readyForPickup: 0,
    completed: 0,
  };

  selectedOrderForPrint: IWorkOrder | null = null;
  currentDate = new Date();

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  isLoading: boolean = false;
  isCreateModalOpen: boolean = false;

  constructor(
    private readonly workOrderService: WorkOrderService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router,
    private route: ActivatedRoute,
    private loadingBarService: LoadingBarService,
    private modalCommonService: ModalCommonService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializePermissions();
    this.searchSubject
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.page = 1;
        this.updateQueryParams();
      });
  }

  private async initializePermissions() {
    try {
      // this.permissions = await this.permissionService.permissions();
      // this.isViewUserList = this.permissionService.isViewUserList;
      // this.isResetPassword = this.permissionService.isResetPassword;
      // if (!this.isViewUserList) {
      //   this.router.navigate(['/not-found']);
      // } else {
      this.route.queryParams.subscribe((params) => {
        (this.updateStateFromQueryParams(params), this.fetchWorkOrders());
      });
      // }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    }
  }

  private updateStateFromQueryParams(params: {
    [key: string]: string | null;
  }): void {
    this.page = Number(params['page'] || 1);
    this.limit = Number(params['limit'] || 10);

    this.sortList = params['sort'] || '';
    this.searchQuery = params['search'] || '';
    this.selectedDate = params['date'] || '';

    this.selectedStatus =
      (params['status'] as EWorkOrderStatus) || EWorkOrderStatus.ALL;
  }

  private updateQueryParams(): void {
    const queryParams: Record<string, string | number | null> = {
      page: this.page,
      limit: this.limit,
      search: this.searchQuery.trim() || null,
      status:
        this.selectedStatus !== EWorkOrderStatus.ALL
          ? this.selectedStatus
          : null,
      date: this.selectedDate || null,
      sort: this.sortList || null,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value.trim());
  }

  onSearch(): void {
    this.page = 1;
    this.updateQueryParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Status
   */
  onStatusChange(): void {
    this.page = 1;
    this.updateQueryParams();
  }

  /**
   * Date
   */
  onDateChange(): void {
    this.page = 1;
    this.updateQueryParams();
  }

  onPageChange(e: any): void {
    console.log(e);
    
    this.page = e.page;
    this.limit = e.pageSize;
    this.updateQueryParams();
  }

  async fetchWorkOrders(): Promise<void> {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const params = {
        page: this.page,
        limit: this.limit,
        search: this.searchQuery.trim() || undefined,
        status:
          this.selectedStatus !== EWorkOrderStatus.ALL
            ? this.selectedStatus
            : undefined,
        date: this.selectedDate || undefined,
        sort: this.sortList || undefined,
      };

      const response = await this.workOrderService.getListWorkOrder(params);

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.workOrders = response.resultData;
        console.log(this.workOrders);
        this.calculateMetrics();
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      this.isLoading = false;
      loader.complete();
    }
  }

  calculateMetrics(): void {
    this.statusCounts = {
      all: this.workOrders.data.length,

      pending: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.PENDING,
      ).length,

      inProgress: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.IN_PROGRESS,
      ).length,

      qualityCheck: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.QUALITY_CHECK,
      ).length,

      waitingParts: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.WAITING_PARTS,
      ).length,

      readyForPickup: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.READY_FOR_PICKUP,
      ).length,

      completed: this.workOrders.data.filter(
        (workOrder) => workOrder.status === EWorkOrderStatus.COMPLETED,
      ).length,
    };
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  async handleCreateWorkOrder(formData: any): Promise<void> {
    try {
      const response = await this.workOrderService.createWorkOrder(formData);

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.closeCreateModal();
        this.handleCommonSuccess();
        await this.fetchWorkOrders();
      }
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  }

  handleViewDetail(order: IWorkOrder): void {
    const workOrderNo = order.workOrderNo;
    this.router.navigate(['/portal/repair/work-orders', workOrderNo]);
  }

  handleNotifyCustomer(order: IWorkOrder): void {
    console.log('Notify customer:', order);
  }

  trackByWorkOrderId(index: number, item: IWorkOrder): string {
    return item._id;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = EWorkOrderStatus.ALL;
    this.selectedDate = '';
    this.page = 1;

    this.updateQueryParams();
  }

  private handleCommonSuccess() {
    this.modalCommonService.open({
      type: 'success',
      title: 'สร้างใบแจ้งซ่อมสำเร็จ',
      subtitle: 'คุณได้สร้างใบแจ้งซ่อมของลูกค้าเรียบร้อยแล้ว',
      buttonText: 'ยืนยัน',
    });
  }

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle:
        'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });
  }

  handlePrintOrder(order: IWorkOrder): void {
    this.selectedOrderForPrint = order;
    this.currentDate = new Date();

    this.cdr.detectChanges();

    const afterPrintHandler = (): void => {
      this.selectedOrderForPrint = null;
      this.cdr.detectChanges();
      window.removeEventListener('afterprint', afterPrintHandler);
    };

    window.addEventListener('afterprint', afterPrintHandler);

    requestAnimationFrame(() => {
      window.print();
    });
  }
}
