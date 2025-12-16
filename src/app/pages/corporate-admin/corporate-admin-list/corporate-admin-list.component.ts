import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IQueryListUser, ISearchCriteria, ITableHeader, IUserResultData } from '../../../shared/interface/table-user-management.interface';
import { Subscription } from 'rxjs';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserManagementService } from '../../../shared/services/user-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
@Component({
  selector: 'app-corporate-admin-list',
  standalone: false,
  templateUrl: './corporate-admin-list.component.html',
  styleUrl: './corporate-admin-list.component.scss'
})
export class CorporateAdminListComponent implements OnInit {
  keyword: string = '';
  page: number = 1
  limit: number = 10;
  sortList: string = '';
  username: string = '';
  phoneNumber: string = '';
  userId: string = '';
  role: string = '';

  isLoadingReset: boolean = false;
  isLoading: boolean = false;

  private modalSubscription: Subscription | null = null;


  headers: ITableHeader[] = [
    { headerName: 'username', valueType: 'string', isSort: true, i18nKey: 'Username' },
    { headerName: 'role', valueType: 'string', isSort: true, i18nKey: 'บทบาท' },
    { headerName: 'manager', valueType: 'date', isSort: true, i18nKey: 'ผู้จัดการ' },
    { headerName: 'phoneNumber', valueType: 'string', isSort: true, i18nKey: 'หมายเลขโทรศัพท์' },
    { headerName: 'activeFlag', valueType: 'date', isSort: false, i18nKey: 'สถานะ' },
    { headerName: 'createDt', valueType: 'string', isSort: false, i18nKey: 'เข้าสู่ระบบล่าสุด' },
    { headerName: 'action', valueType: 'string', isSort: false, i18nKey: 'จัดการ' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalConditionService: ModalConditionService,
    private modalCommonService: ModalCommonService,
    private userManagementService: UserManagementService
  ) { }



  userList: IUserResultData = {
    keyword: '',
    page: 1,
    limit: 10,
    total: 3,
    totalPage: 1,
    users: [
      {
        id: 'U001',
        publicId: 'USR-001',
        role: 'ADM',
        managerName: null,
        phoneNumber: '0812345678',
        activeFlag: true,
        lastAccess: '2025-01-10T10:23:00'
      },
      {
        id: 'U002',
        publicId: 'USR-002',
        role: 'MNG',
        managerName: 'John Manager',
        phoneNumber: '0853332222',
        activeFlag: false,
        lastAccess: null
      },
      {
        id: 'U003',
        publicId: 'USR-003',
        role: 'SAL',
        managerName: null,
        phoneNumber: '0891112222',
        activeFlag: true,
        lastAccess: '2025-01-12T08:51:00'
      },
      {
        id: 'U004',
        publicId: 'USR-004',
        role: 'ACC',
        managerName: 'Alice Manager',
        phoneNumber: '0825556666',
        activeFlag: true,
        lastAccess: '2025-01-11T14:30:00'
      }
    ]
  };

  ngOnInit(): void {
    this.initializePermissions();
  }

  private async initializePermissions() {
    this.route.queryParams.subscribe(params => this.updateQueryParams(params));
    // try {
    //   this.permissions = await this.permissionService.permissions();
    //   this.isViewDetailReport = this.permissionService.isViewDetailReport;
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

  onSearchSubmit(criteria: ISearchCriteria) {
    this.username = criteria.publicId ?? '';
    this.role = criteria.role ?? '';
    this.page = 1;
    this.updateUrlParams();
  }

  onResetCriteria() {
    this.username = '';
    this.role = '';
    this.sortList = '';
    this.page = 1;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        username: null,
        role: null,
        sort: null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  onCreate() {
    this.router.navigate(['/portal/corporate-admin/account/create']);
  }

  onReset(event: string) {
    this.userId = event;
    this.handleModalReset();
  }

  viewDetail(event: string) {
    this.router.navigate(['/portal/corporate-admin/account/detail', event]);
  }

  private updateQueryParams(params: any) {
    this.keyword = params['keyword'] || '';
    this.page = Number(params['page'] || this.page);
    this.limit = Number(params['limit'] || this.limit);
    this.sortList = params['sort'] || '';
    this.username = params['username'] || '';
    // this.phoneNumber = params['phoneNumber'] || '';
    this.role = params['role'] || '';
    this.getListUser();
  }


  private updateUrlParams() {
    const queryParams = {
      page: this.page.toString(),
      limit: this.limit.toString(),
      sort: this.sortList || undefined,
      username: this.username || undefined,
      // phoneNumber: this.phoneNumber || undefined,
      role: this.role || undefined,
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  onSearch(search: string) {
    this.keyword = search;
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

  private async getListUser() {
    console.log('Get list user');
    this.isLoading = true;
    try {
      const params: IQueryListUser = {
        publicId: this.username || undefined,
        role: this.role || undefined,
        page: this.page,
        limit: this.limit,
        sort: this.sortList ? this.sortList : 'createDt.desc'
      };
      const res = await this.userManagementService.getListUser(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.userList = res.resultData;
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
    }
  }
  private resetPassword() {
    console.log("UserID: ", this.userId);
  }

  async handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.resetPassword();
    }
  }

  private handleModalReset() {
    this.modalConditionService.open({
      type: 'change',
      title: 'REPORT_HISTORY.RESEND_REPORT_TITLE',
      subtitle: 'REPORT_HISTORY.RESEND_REPORT_SUBTITLE',
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

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
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
