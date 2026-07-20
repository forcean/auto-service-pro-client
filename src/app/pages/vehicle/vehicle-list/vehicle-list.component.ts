import { Component, OnInit, ViewChild } from '@angular/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PermissionService } from '../../../shared/services/permission.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { ROLE } from '../../../shared/enum/role.enum';
import {
  IQueryVehicle,
  ISearchVehicle,
  ITableHeaderVehicle,
  IVehicleResultData,
} from '../../../shared/interface/table-vehicle.interface';
import { EVehicleStatus } from '../../../shared/enum/vehicle.enum';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { VehicleManagementService } from '../../../shared/services/vehicle-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';

export const MOCK_VEHICLE_LIST: IVehicleResultData = {
  keyword: '',

  page: 1,

  limit: 10,

  total: 10,

  totalPage: 1,

  vehicles: [
    {
      id: 'VH001',

      plateNumber: '1กข 1234',

      ownerName: 'สมชาย ใจดี',

      brand: 'Toyota',

      model: 'Camry',

      year: 2022,

      mileage: 32540,

      vin: 'JTNB11HK5N3000001',

      engineNumber: '2ARFE123456',

      color: 'White',

      lastServiceDate: '2026-07-10T09:30:00Z',

      status: EVehicleStatus.REPAIRING,
    },

    {
      id: 'VH002',

      plateNumber: '2ขค 5678',

      ownerName: 'วิภา ศรีสุข',

      brand: 'Honda',

      model: 'Civic',

      year: 2021,

      mileage: 48720,

      vin: 'MRHFC1670MT000002',

      engineNumber: 'L15B7123456',

      color: 'Black',

      lastServiceDate: '2026-07-14T13:00:00Z',

      status: EVehicleStatus.WAITING_PARTS,
    },

    {
      id: 'VH003',

      plateNumber: '3งจ 9012',

      ownerName: 'อนุชา พงษ์ไทย',

      brand: 'Mazda',

      model: 'CX-5',

      year: 2023,

      mileage: 15200,

      color: 'Red',

      lastServiceDate: '2026-07-16T10:15:00Z',

      status: EVehicleStatus.INSPECTING,
    },

    {
      id: 'VH004',

      plateNumber: '4ฉช 3456',

      ownerName: 'กิตติชัย บุญมา',

      brand: 'Ford',

      model: 'Ranger',

      year: 2020,

      mileage: 89650,

      color: 'Blue',

      lastServiceDate: '2026-07-12T15:45:00Z',

      status: EVehicleStatus.QUALITY_CHECK,
    },

    {
      id: 'VH005',

      plateNumber: '5ซญ 7890',

      ownerName: 'นภัสสร แสงทอง',

      brand: 'Toyota',

      model: 'Hilux Revo',

      year: 2024,

      mileage: 8400,

      color: 'Silver',

      lastServiceDate: '2026-07-15T08:20:00Z',

      status: EVehicleStatus.READY_FOR_PICKUP,
    },

    {
      id: 'VH006',

      plateNumber: '6ฎฏ 1122',

      ownerName: 'ธนพล สุขใจ',

      brand: 'Honda',

      model: 'City',

      year: 2019,

      mileage: 112350,

      color: 'Gray',

      lastServiceDate: '2026-07-08T11:00:00Z',

      status: EVehicleStatus.COMPLETED,
    },

    {
      id: 'VH007',

      plateNumber: '7ฐฑ 3344',

      ownerName: 'ปรียา รัตนา',

      brand: 'Isuzu',

      model: 'D-Max',

      year: 2021,

      mileage: 65880,

      color: 'White',

      lastServiceDate: '2026-07-11T14:30:00Z',

      status: EVehicleStatus.PENDING,
    },

    {
      id: 'VH008',

      plateNumber: '8ฒณ 5566',

      ownerName: 'เอกชัย วัฒนา',

      brand: 'Nissan',

      model: 'Almera',

      year: 2022,

      mileage: 28640,

      color: 'Black',

      lastServiceDate: '2026-07-09T16:00:00Z',

      status: EVehicleStatus.WAITING_APPROVAL,
    },

    {
      id: 'VH009',

      plateNumber: '9ดต 7788',

      ownerName: 'ศศิธร คำดี',

      brand: 'Mitsubishi',

      model: 'Xpander',

      year: 2023,

      mileage: 19420,

      color: 'Orange',

      lastServiceDate: '2026-07-13T09:00:00Z',

      status: EVehicleStatus.CANCELLED,
    },

    {
      id: 'VH010',

      plateNumber: '1กก 9999',

      ownerName: 'วรพงษ์ เจริญ',

      brand: 'BYD',

      model: 'Atto 3',

      year: 2025,

      mileage: 5200,

      color: 'Blue',

      lastServiceDate: '2026-07-17T08:30:00Z',

      status: EVehicleStatus.REPAIRING,
    },
  ],
};

@Component({
  selector: 'app-vehicle-list',
  standalone: false,
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
})
export class VehicleListComponent implements OnInit {
  @ViewChild(ModalConditionComponent)
  modalConditionComponent!: ModalConditionComponent;
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;
  // @ViewChild(ResetPasswordModuleComponent) resetPasswordModuleComponent!: ResetPasswordModuleComponent;

  licensePlate: string = '';
  province:string = '';
  page: number = 1;
  limit: number = 10;
  sortList: string = '';
  brand: string = '';
  vehicle: string = '';
  vehicleId: string = '';
  model: string = '';
  status: EVehicleStatus | '' = '';
  vehicleList!: IVehicleResultData;
  permissions!: PermissionService;

  isLoadingReset: boolean = false;
  isLoading: boolean = false;

  isViewVehicleList: boolean = false;
  isCreateVehicle: boolean = false;
  isUpdateVehicle: boolean = false;
  isDeleteVehicle: boolean = false;
  isViewVehicleDetail: boolean = false;

  private modalSubscription: Subscription | null = null;

  headers: ITableHeaderVehicle[] = [
    {
      headerName: 'plateNumber',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ทะเบียนรถ',
    },
    {
      headerName: 'ownerName',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ผู้ครอบครอง',
    },
    {
      headerName: 'brand',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ยี่ห้อ',
    },
    {
      headerName: 'model',
      valueType: 'string',
      isSort: true,
      i18nKey: 'รุ่น',
    },
    {
      headerName: 'mileage',
      valueType: 'number',
      isSort: true,
      i18nKey: 'เลขไมล์',
    },
    {
      headerName: 'lastServiceDate',
      valueType: 'date',
      isSort: true,
      i18nKey: 'เข้ารับบริการล่าสุด',
    },
    {
      headerName: 'status',
      valueType: 'string',
      isSort: true,
      i18nKey: 'สถานะ',
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
    private vehicleManagementService: VehicleManagementService,
    private handleTokenService: HandleTokenService,
    // private resetFormService: ResetPasswordModuleService,
    private loadingBarService: LoadingBarService,
    private permissionService: PermissionService,
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
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        this.handleCommonError();
      }
    }
  }

  onResetCriteria() {
    this.licensePlate = '';
    this.province = '';
    this.model = '';
    this.brand = '';
    this.status = '';
    this.sortList = '';
    this.page = 1;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        licensePlate: null,
        province: null,
        brand: null,
        model: null,
        status: null,
        sort: null,
        page: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  onCreate() {
    this.router.navigate(['/portal/vehicle/create']);
  }

  viewDetail(event: string) {
    this.router.navigate(['/portal/vehicle/', event]);
  }

  onEdit(event: string) {
    this.router.navigate(['/portal/vehicle/', event, 'edit']);
  }

  onDelete(event: string) {
    this.vehicleId = event;
    console.log(this.vehicleId);
    
    this.handleModalDelete();
  }

  private updateQueryParams(params: any) {
    this.page = Number(params['page'] || this.page);
    this.limit = Number(params['limit'] || this.limit);
    this.sortList = params['sort'] || '';
    this.licensePlate = params['licensePlate'] || '';
    this.province = params['province'] || '';
    this.brand = params['brand'] || '';
    this.model = params['model'] || '';
    this.status = (params['status'] as EVehicleStatus) || '';
    this.getListVehicle();
  }

  private updateUrlParams() {
    const queryParams = {
      page: this.page.toString(),
      limit: this.limit.toString(),
      sort: this.sortList || undefined,
      vehicle: this.vehicle || undefined,
      licensePlate: this.licensePlate || undefined,
      province: this.province || undefined,
      brand: this.brand || undefined,
      model: this.model || undefined,
      status: this.status || undefined,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  onSearch(search: ISearchVehicle) {
    this.licensePlate = search.licensePlate || '';
    this.province = search.province || '';
    this.brand = search.brand || '';
    this.model = search.model || '';
    this.status = (search.status as EVehicleStatus) || '';
    this.page = 1;
    this.updateUrlParams();
  }

  onChangePage(event: any) {
    this.page = event.page;
    this.limit = event.pageSize;
    this.updateUrlParams();
  }

  onSort(event: string[]) {
    this.sortList = event.join(',');
    this.updateUrlParams();
  }

  private async getListVehicle() {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const params: IQueryVehicle = {
        licensePlate: this.licensePlate || undefined,
        province: this.province || undefined,
        brand: this.brand || undefined,
        model: this.model || undefined,
        status: this.status || undefined,
        page: this.page,
        limit: this.limit,
        sort: this.sortList ? this.sortList : 'createDt.desc',
      };
      console.log('Api', params);
      this.vehicleList = MOCK_VEHICLE_LIST;

      const res = await this.vehicleManagementService.getListVehicle(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.vehicleList = res.resultData;
        // this.isDisableSearch = (!this.keyword && this.userList?.users.length === 0 && !this.reportStatus)
        //   || !this.reportStatusList.length;
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

  private async deleteCustomerVehicle(id: string) {
   this.isLoadingReset = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      this.modalConditionComponent.onClose();
      const res = await this.vehicleManagementService.deleteCustomerVehicle(id);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleSuccessDelete();
        this.updateUrlParams();
      } else {
        this.handleFailDelete();
      }
    } catch (error) {
      console.error('Response error', error);
      this.handleCommonError();
    } finally {
      this.isLoadingReset = false;
      loader.complete();
    }
  }

  async handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.deleteCustomerVehicle(this.vehicleId);
    }
  }

  private handleModalDelete() {
    this.modalConditionService.open({
      type: 'change',
      title: 'คุณต้องการลบรถลูกค้าคันนี้หรือไม่?',
      subtitle:
        'คุณต้องการยืนยันการลบหรือไม่? การคลิก ยืนยัน <br>จะลบอย่างถาวร คลิก ยกเลิก เพื่อออก',
    });
  }

  private handleCommonError() {
    // this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
    //   if (!obj?.isOpen) {
    //     this.router.navigate(['/portal/landing']);
    //     this.unsubscribeModal();
    //   }
    // });
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

  private handleSuccessDelete() {
    this.modalCommonService.open({
      type: 'success',
      title: 'ลบรถในลูกค้าสำเร็จ',
      subtitle: 'รถคันนี้ถูกลบออกจากระบบเรียบร้อยแล้ว.',
      buttonText: 'เข้าใจแล้ว',
    });
  }

  private handleFailDelete() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ไม่สามารถลบรถคันนี้ได้',
      subtitle: 'ไม่สามารถลบรถคันนี้ได้ โปรดลองอีกครั้งหรือติดต่อ<br>ผู้ดูแลระบบหากปัญหายังคงอยู่',
      buttonText: 'ยืนยัน',
    });
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }
}
