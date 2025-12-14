import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ITableHeader, IUserResultData } from '../../../shared/interface/table-user-management.interface';
import { Subscription } from 'rxjs';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
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

  isLoadingReset: boolean = false;

  private modalSubscription: Subscription | null = null;


  headers: ITableHeader[] = [
    { headerName: 'username', valueType: 'string', isSort: true, i18nKey: 'username' },
    { headerName: 'role', valueType: 'string', isSort: true, i18nKey: 'role' },
    { headerName: 'manager', valueType: 'date', isSort: true, i18nKey: 'manager' },
    { headerName: 'phoneNumber', valueType: 'string', isSort: true, i18nKey: 'phoneNumber' },
    { headerName: 'activeFlag', valueType: 'date', isSort: false, i18nKey: 'status' },
    { headerName: 'createDt', valueType: 'string', isSort: false, i18nKey: 'lastLogin' },
    { headerName: 'action', valueType: 'string', isSort: false, i18nKey: 'action' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalConditionService: ModalConditionService,
    private modalCommonService: ModalCommonService) { }



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
    this.phoneNumber = params['phoneNumber'] || '';
    this.getListUser();
  }

  private updateUrlParams() {
    const queryParams = {
      keyword: this.keyword || undefined,
      page: this.page.toString(),
      limit: this.limit.toString(),
      sort: this.sortList || undefined,
      username: this.username || undefined,
      phoneNumber: this.phoneNumber || undefined,
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

  private getListUser() {
    console.log('Get list user');

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

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }
}
