import { Component, OnInit, ViewChild } from '@angular/core';
import {
  IQueryListHistory,
  IServiceHistoryResultData,
  ITableHeaderServiceHistory,
} from '../../../shared/interface/table-vehicle-service-history.interface';
import { IWorkOrder } from '../../../shared/components/vehicle-work-orders/vehicle-work-orders.component';
import { IVehicleDocument } from '../../../shared/components/vehicle-documents/vehicle-documents.component';
import { IImageGalleryItem } from '../../../shared/components/image-gallery/image-gallery.component';
import { PermissionService } from '../../../shared/services/permission.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { ResetPasswordModuleService } from '../../../shared/components/reset-password-modal/reset-password-modal.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { Subscription } from 'rxjs';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ServiceHistoryDetailData } from '../../../shared/components/service-history-panel/service-history-panel.component';
import { VehicleManagementService } from '../../../shared/services/vehicle-management.service';
import { IVehicleKey } from '../../../shared/interface/table-vehicle.interface';
import { IVehicleOverviewState } from '../../../shared/interface/customer-vehicle-management.interface';

export type VehicleDetailTab =
  | 'overview'
  | 'history'
  | 'work-orders'
  | 'documents'
  | 'photos';
@Component({
  selector: 'app-vehicle-detail',
  standalone: false,
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss',
})
export class VehicleDetailComponent implements OnInit {
  @ViewChild(ModalConditionComponent)
  modalConditionComponent!: ModalConditionComponent;
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;
  // @ViewChild(ResetPasswordModuleComponent) resetPasswordModuleComponent!: ResetPasswordModuleComponent;

  loading = false;
  activeTab: VehicleDetailTab = 'overview';

  vehicleData: any;
  private vehicleKey!: IVehicleKey;
  overviewState!: IVehicleOverviewState;
  serviceHistory!: IServiceHistoryResultData;
  workOrders: IWorkOrder[] = [];
  documents: IVehicleDocument[] = [];
  photos: IImageGalleryItem[] = [];
  selectedHistory: ServiceHistoryDetailData | null = null;

  permissions!: PermissionService;
  historyQuery: IQueryListHistory = {
    page: 1,
    limit: 20,
    sort: '',
  };

  workOrderQuery = {
    page: 1,
    limit: 20,
    sort: '',
    keyword: '',
  };

  documentQuery = {
    page: 1,
    limit: 20,
    sort: '',
  };

  photoQuery = {
    page: 1,
    limit: 20,
  };

  // loading status
  isLoading = false;
  isLoadingWorkOrder = false;
  isLoadingOverView = false;
  isLoadingHistory = false;
  isLoadingDocument = false;
  isLoadingPhoto = false;

  private modalSubscription: Subscription | null = null;
  private readonly loadedTabs = new Set<VehicleDetailTab>();

  //Table
  headers: ITableHeaderServiceHistory[] = [
    {
      headerName: 'id',
      valueType: 'string',
      isSort: true,
      i18nKey: 'หมายเลขงาน',
    },
    {
      headerName: 'mileage',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ไมล์',
    },
    {
      headerName: 'service',
      valueType: 'string',
      isSort: false,
      i18nKey: 'service',
    },
    {
      headerName: 'date',
      valueType: 'string',
      isSort: true,
      i18nKey: 'วันที่',
    },
    {
      headerName: 'mechanic',
      valueType: 'string',
      isSort: true,
      i18nKey: 'mechanic',
    },
    {
      headerName: 'action',
      valueType: 'string',
      isSort: false,
      i18nKey: 'จัดการ',
    },
  ];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalConditionService: ModalConditionService,
    private modalCommonService: ModalCommonService,
    private handleTokenService: HandleTokenService,
    private resetFormService: ResetPasswordModuleService,
    private loadingBarService: LoadingBarService,
    private permissionService: PermissionService,
    private vehicleManagementService: VehicleManagementService,
  ) {}

  ngOnInit(): void {
    const licensePlate = this.route.snapshot.paramMap.get('licensePlate');
    const province = this.route.snapshot.paramMap.get('province');
    if (licensePlate && province) {
      this.vehicleKey = { licensePlate, province };
    }
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
      this.getVehicle();
      this.route.queryParams.subscribe((params) =>
        this.updateQueryParams(params),
      );
      // }
    } catch (error) {
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        this.handleCommonError();
      }
    }
  }

  private updateQueryParams(params: Params): void {
    this.activeTab = (params['tab'] as VehicleDetailTab) ?? 'overview';

    switch (this.activeTab) {
      case 'history':
        this.historyQuery.page = Number(
          params['historyPage'] ?? this.historyQuery.page,
        );
        this.historyQuery.limit = Number(
          params['historyLimit'] ?? this.historyQuery.limit,
        );
        this.historyQuery.sort = params['historySort'] ?? undefined;
        break;

      case 'work-orders':
        this.workOrderQuery.page = Number(
          params['woPage'] ?? this.workOrderQuery.page,
        );
        this.workOrderQuery.limit = Number(
          params['woLimit'] ?? this.workOrderQuery.limit,
        );
        this.workOrderQuery.sort = params['woSort'] ?? this.workOrderQuery.sort;
        this.workOrderQuery.keyword =
          params['woKeyword'] ?? this.workOrderQuery.keyword;
        break;

      case 'documents':
        this.documentQuery.page = Number(
          params['docPage'] ?? this.documentQuery.page,
        );
        this.documentQuery.limit = Number(
          params['docLimit'] ?? this.documentQuery.limit,
        );
        this.documentQuery.sort = params['docSort'] ?? this.documentQuery.sort;
        break;

      case 'photos':
        this.photoQuery.page = Number(
          params['photoPage'] ?? this.photoQuery.page,
        );
        this.photoQuery.limit = Number(
          params['photoLimit'] ?? this.photoQuery.limit,
        );
        break;
    }

    this.loadCurrentTab();
  }

  async getVehicle(): Promise<void> {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const res = await this.vehicleManagementService.getVehicleDetail(
        this.vehicleKey.licensePlate,
        this.vehicleKey.province,
      );
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.vehicleData = res.resultData;
      } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoading = false;
      loader.complete();
    }
  }

  async getOverview(): Promise<void> {
    this.isLoadingOverView = true;
    try {
      const res = await this.vehicleManagementService.getVehicleOverview(
        this.vehicleKey.licensePlate,
        this.vehicleKey.province,
      );
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.overviewState = res.resultData;
        // this.isDisableSearch = (!this.keyword && this.userList?.users.length === 0 && !this.reportStatus)
        //   || !this.reportStatusList.length;
      } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
      } else {
        this.handleFailResponse();
        this.overviewState = res.resultData;
      }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoadingOverView = false;
    }
  }

  async getHistory(): Promise<void> {
    this.isLoadingHistory = true;
    try {
      const res = await this.vehicleManagementService.getVehicleServices(
        this.vehicleKey.licensePlate,
        this.vehicleKey.province,
      );
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.serviceHistory = res.resultData;
      } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoadingHistory = false;
    }
  }

  async getWorkOrders(): Promise<void> {
    this.isLoadingWorkOrder = true;
    try {
      const res = await this.vehicleManagementService.getVehicleWorkOrders(
        this.vehicleKey.licensePlate,
        this.vehicleKey.province,
      );
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.workOrders = res.resultData;
      } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoadingWorkOrder = false;
    }
  }

  getDocuments(): void {
    this.isLoadingDocument = true;
    try {
      // const res = await this.userManagementService.getListUser();
      // if (res.resultCode === RESPONSE.SUCCESS) {
      //   this.vehicle = res.resultData;
      //   // this.isDisableSearch = (!this.keyword && this.userList?.users.length === 0 && !this.reportStatus)
      //   //   || !this.reportStatusList.length;
      // } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
      //   this.router.navigate(['/not-found']);
      // } else {
      //   this.handleFailResponse();
      // }
      this.documents = [
        {
          id: 'DOC001',
          name: 'Invoice_WO240715001.pdf',
          category: 'Invoice',
          type: 'pdf',
          size: '1.8 MB',
          uploadedAt: '15 Jul 2026',
          url: '/assets/mock/documents/invoice-001.pdf',
        },
        {
          id: 'DOC002',
          name: 'Quotation_Brake_Service.pdf',
          category: 'Quotation',
          type: 'pdf',
          size: '950 KB',
          uploadedAt: '14 Jul 2026',
          url: '/assets/mock/documents/quotation-001.pdf',
        },
        {
          id: 'DOC003',
          name: 'Receipt_Repair_240701.pdf',
          category: 'Receipt',
          type: 'pdf',
          size: '780 KB',
          uploadedAt: '10 Jul 2026',
          url: '/assets/mock/documents/receipt-001.pdf',
        },
        {
          id: 'DOC004',
          name: 'Warranty_Battery.jpg',
          category: 'Warranty',
          type: 'jpg',
          size: '2.4 MB',
          uploadedAt: '08 Jul 2026',
          url: '/assets/mock/documents/warranty-battery.jpg',
        },
        {
          id: 'DOC005',
          name: 'Insurance_Policy.pdf',
          category: 'Insurance',
          type: 'pdf',
          size: '3.2 MB',
          uploadedAt: '01 Jul 2026',
          url: '/assets/mock/documents/insurance-policy.pdf',
        },
        {
          id: 'DOC006',
          name: 'Vehicle_Registration.pdf',
          category: 'Other',
          type: 'pdf',
          size: '1.1 MB',
          uploadedAt: '28 Jun 2026',
          url: '/assets/mock/documents/vehicle-registration.pdf',
        },
        {
          id: 'DOC007',
          name: 'Engine_Diagnosis_Report.docx',
          category: 'Other',
          type: 'docx',
          size: '540 KB',
          uploadedAt: '20 Jun 2026',
          url: '/assets/mock/documents/engine-report.docx',
        },
        {
          id: 'DOC008',
          name: 'Service_Checklist.xlsx',
          category: 'Other',
          type: 'xlsx',
          size: '320 KB',
          uploadedAt: '18 Jun 2026',
          url: '/assets/mock/documents/service-checklist.xlsx',
        },
      ];
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoadingDocument = false;
    }
  }

  getPhotos(): void {
    this.isLoadingPhoto = true;
    try {
      // const res = await this.userManagementService.getListUser();
      // if (res.resultCode === RESPONSE.SUCCESS) {
      //   this.vehicle = res.resultData;
      //   // this.isDisableSearch = (!this.keyword && this.userList?.users.length === 0 && !this.reportStatus)
      //   //   || !this.reportStatusList.length;
      // } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
      //   this.router.navigate(['/not-found']);
      // } else {
      //   this.handleFailResponse();
      // }
      this.photos = [
        {
          id: 'IMG001',
          url: 'https://picsum.photos/id/1071/1200/800',
          thumbnail: 'https://picsum.photos/id/1071/600/400',
          title: 'Front View',
          description: 'Vehicle front side',
          uploadedAt: '15 Jul 2026',
        },
        {
          id: 'IMG002',
          url: 'https://picsum.photos/id/1072/1200/800',
          thumbnail: 'https://picsum.photos/id/1072/600/400',
          title: 'Rear View',
          description: 'Vehicle rear side',
          uploadedAt: '15 Jul 2026',
        },
        {
          id: 'IMG003',
          url: 'https://picsum.photos/id/1073/1200/800',
          thumbnail: 'https://picsum.photos/id/1073/600/400',
          title: 'Engine Bay',
          description: 'Engine inspection',
          uploadedAt: '14 Jul 2026',
        },
        {
          id: 'IMG004',
          url: 'https://picsum.photos/id/1074/1200/800',
          thumbnail: 'https://picsum.photos/id/1074/600/400',
          title: 'Interior',
          description: 'Cabin condition',
          uploadedAt: '14 Jul 2026',
        },
        {
          id: 'IMG005',
          url: 'https://picsum.photos/id/1075/1200/800',
          thumbnail: 'https://picsum.photos/id/1075/600/400',
          title: 'Left Side',
          description: 'Body inspection',
          uploadedAt: '13 Jul 2026',
        },
        {
          id: 'IMG006',
          url: 'https://picsum.photos/id/1076/1200/800',
          thumbnail: 'https://picsum.photos/id/1076/600/400',
          title: 'Right Side',
          description: 'Body inspection',
          uploadedAt: '13 Jul 2026',
        },
      ];
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    } finally {
      this.isLoadingPhoto = false;
    }
  }

  changeTab(tab: VehicleDetailTab): void {
    if (this.activeTab === tab) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: this.getTabQueryParams(tab),
    });
  }

  private getTabQueryParams(tab: VehicleDetailTab): Params {
    switch (tab) {
      case 'history':
        return {
          tab,
          historyPage: this.historyQuery.page,
          historyLimit: this.historyQuery.limit,
          historySort: this.historyQuery.sort || undefined,
        };

      case 'work-orders':
        return {
          tab,
          woPage: this.workOrderQuery.page,
          woLimit: this.workOrderQuery.limit,
          woSort: this.workOrderQuery.sort,
          woKeyword: this.workOrderQuery.keyword,
        };

      case 'documents':
        return {
          tab,
          docPage: this.documentQuery.page,
          docLimit: this.documentQuery.limit,
          docSort: this.documentQuery.sort,
        };

      case 'photos':
        return {
          tab,
          photoPage: this.photoQuery.page,
          photoLimit: this.photoQuery.limit,
        };

      default:
        return {
          tab: 'overview',
        };
    }
  }

  private loadCurrentTab(): void {
    switch (this.activeTab) {
      case 'overview':
        if (!this.loadedTabs.has('overview')) {
          this.loadedTabs.add('overview');
          this.getOverview();
        }
        break;

      case 'history':
        this.getHistory();
        break;

      case 'work-orders':
        this.getWorkOrders();
        break;

      case 'documents':
        this.getDocuments();
        break;

      case 'photos':
        this.getPhotos();
        break;
    }
  }

  editVehicle(): void {
    this.router.navigate([
      '/portal/vehicle',
      this.vehicleKey.licensePlate,
      this.vehicleKey.province,
      'edit',
    ]);
  }

  deleteVehicle(): void {
    const confirmed = confirm('Are you sure you want to delete this vehicle?');

    if (!confirmed) return;

    console.log('Delete Vehicle');
  }

  back(): void {
    history.back();
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';

      case 'INACTIVE':
        return 'Inactive';

      default:
        return '-';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';

      case 'INACTIVE':
        return 'status-inactive';

      default:
        return '';
    }
  }

  getWorkOrderClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'badge-open';

      case 'IN_PROGRESS':
        return 'badge-progress';

      case 'COMPLETED':
        return 'badge-completed';

      default:
        return '';
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  onSort(sort: string[]): void {
    this.historyQuery.sort = sort.join(',');
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        tab: 'history',
        historyPage: this.historyQuery.page,
        historyLimit: this.historyQuery.limit,
        historySort: this.historyQuery.sort,
      },
    });
  }

  onChangePage(event: any): void {
    this.historyQuery.page = event.page;
    this.historyQuery.limit = event.pageSize;
    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        tab: 'history',
        historyPage: this.historyQuery.page,
        historyLimit: this.historyQuery.limit,
        historySort: this.historyQuery.sort,
      },
    });
  }

  onViewService(event: string) {
    console.log('View History Service: ', event);
    try {
      this.selectedHistory = {
        invoiceNumber: 'INV2400233',
        workOrderId: 'WO-2026-0892',
        serviceDate: '12 Jul 2026',
        mileage: 125340,
        mechanicName: 'ช่างวิชัย พี.',
        subTotal: 2580,
        vatRate: 7,
        vatAmount: 180.6,
        totalAmount: 2760.6,
        mechanicNotes:
          'ตรวจพบผ้าเบรกหน้าเหลือประมาณ 4mm คาดว่าต้องเปลี่ยนในรอบถัดไป',
        items: [
          {
            name: 'น้ำมันเครื่อง Fully Synthetic 5W-30',
            sku: 'MOBIL1-5W30-4L',
            quantity: 1,
            price: 1850,
          },
          {
            name: 'กรองน้ำมันเครื่อง แท้ศูนย์',
            sku: 'TOY-04152-YZZA1',
            quantity: 1,
            price: 280,
          },
          {
            name: 'สลับยางถ่วงล้อ 4 ล้อ',
            category: 'ค่าบริการ/ค่าแรงช่าง',
            quantity: 1,
            price: 450,
          },
        ],
      };
    } catch (error) {}
  }

  onClosePanel() {
    this.selectedHistory = null;
  }

  private openResetPasswordForm() {
    this.modalConditionComponent.onClose();
    this.resetFormService.open({});
  }

  async handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.openResetPasswordForm();
    }
  }

  private handleModalReset() {
    this.modalConditionService.open({
      type: 'change',
      title: 'คุณต้องการรีเซ็ตรหัสผ่านหรือไม่?',
      subtitle:
        'คุณต้องการยืนยันการเปลี่ยนรหัสผ่านหรือไม่? การคลิก ยืนยัน <br>จะพาคุณไปยังหน้าการเปลี่ยนรหัสผ่าน คลิก ยกเลิก เพื่อออก',
    });
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        // this.router.navigate(['/portal/landing']);
        this.unsubscribeModal();
      }
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

  private handleSuccessResetPassword() {
    this.modalCommonService.open({
      type: 'success',
      title: 'การรีเซ็ตรหัสผ่านเสร็จสมบูรณ์',
      subtitle:
        'การรีเซ็ตรหัสผ่านเสร็จสมบูรณ์แล้ว กรุณาใช้รหัสผ่านใหม่ของคุณในการเข้าสู่ระบบ',
      buttonText: 'ยืนยัน',
    });
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }
  copyVin(vin: string): void {
    if (vin) {
      navigator.clipboard.writeText(vin);
      // สามารถใส่ Notification หรือ Toast แจ้งเตือนตรงนี้ได้
    }
  }
}
