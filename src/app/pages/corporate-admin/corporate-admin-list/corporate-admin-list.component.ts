import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IQueryListUser, ISearchCriteria, ITableHeader, IUserResultData } from '../../../shared/interface/table-user-management.interface';
import { Subscription } from 'rxjs';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserManagementService } from '../../../shared/services/user-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ROLE } from '../../../shared/enum/role.enum';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ResetPasswordModuleComponent } from '../../../shared/components/reset-password-modal/reset-password-modal.component';
import { ResetPasswordModuleService } from '../../../shared/components/reset-password-modal/reset-password-modal.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { PermissionService } from '../../../shared/services/permission.service';
@Component({
  selector: 'app-corporate-admin-list',
  standalone: false,
  templateUrl: './corporate-admin-list.component.html',
  styleUrl: './corporate-admin-list.component.scss'
})
export class CorporateAdminListComponent implements OnInit {
  @ViewChild(ModalConditionComponent) modalConditionComponent!: ModalConditionComponent;
  @ViewChild(PaginationComponent) paginationComponent!: PaginationComponent;
  @ViewChild(ResetPasswordModuleComponent) resetPasswordModuleComponent!: ResetPasswordModuleComponent;

  keyword: string = '';
  page: number = 1
  limit: number = 10;
  sortList: string = '';
  username: string = '';
  phoneNumber: string = '';
  userId: string = '';
  role: string = '';
  userList!: IUserResultData;
  permissions!: PermissionService;

  isLoadingReset: boolean = false;
  isLoading: boolean = false;
  isRoleSO: boolean = true;
  isRoleAMD: boolean = true;
  isPasswordInvalid: boolean = false;
  isResetPassword: boolean = false;
  isViewUserList: boolean = false;
  isDeleteUser: boolean = false;
  isCreateUser: boolean = false;

  private modalSubscription: Subscription | null = null;

  headers: ITableHeader[] = [
    { headerName: 'username', valueType: 'string', isSort: true, i18nKey: 'Username' },
    { headerName: 'role', valueType: 'string', isSort: true, i18nKey: 'บทบาท' },
    { headerName: 'manager', valueType: 'date', isSort: true, i18nKey: 'ผู้จัดการ' },
    { headerName: 'phoneNumber', valueType: 'string', isSort: false, i18nKey: 'หมายเลขโทรศัพท์' },
    { headerName: 'activeFlag', valueType: 'date', isSort: false, i18nKey: 'สถานะ' },
    { headerName: 'createDt', valueType: 'string', isSort: false, i18nKey: 'เข้าสู่ระบบล่าสุด' },
    { headerName: 'action', valueType: 'string', isSort: false, i18nKey: 'จัดการ' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalConditionService: ModalConditionService,
    private modalCommonService: ModalCommonService,
    private userManagementService: UserManagementService,
    private handleTokenService: HandleTokenService,
    private resetFormService: ResetPasswordModuleService,
    private loadingBarService: LoadingBarService,
    private permissionService: PermissionService
  ) {
    this.role = this.handleTokenService.getRole();
    this.isRoleSO = this.role === ROLE.SO;
    this.isRoleAMD = this.role === ROLE.ADM;
  }

  ngOnInit(): void {
    this.initializePermissions();
  }

  private async initializePermissions() {
    try {
      this.permissions = await this.permissionService.permissions();
      this.isViewUserList = this.permissionService.isViewUserList;
      this.isResetPassword = this.permissionService.isResetPassword;
      this.isDeleteUser = this.permissionService.isDeleteUser;
      this.isCreateUser = this.permissionService.isCreateUser;
      if (!this.isViewUserList) {
        this.router.navigate(['/not-found']);
      } else {
        this.route.queryParams.subscribe(params => this.updateQueryParams(params));
      }
    } catch (error) {
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        this.handleCommonError();
      }
    }
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
    this.role = params['role'] || '';
    this.getListUser();
  }

  private updateUrlParams() {
    const queryParams = {
      page: this.page.toString(),
      limit: this.limit.toString(),
      sort: this.sortList || undefined,
      username: this.username || undefined,
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

  closeModalResetPassword(): void {
    this.resetPasswordModuleComponent.closeModal();
  }

  private async getListUser() {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const params: IQueryListUser = {
        publicId: this.username || undefined,
        role: this.role || undefined,
        page: this.page,
        limit: this.limit,
        // sort: this.sortList ? this.sortList : 'createDt.desc'
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
      loader.complete();
    }
  }

  async resetPasswordEvent(pwd: string) {
    this.isLoadingReset = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const res = await this.userManagementService.resetPassword(pwd, this.userId);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.closeModalResetPassword();
        this.handleSuccessResetPassword();
      } else if (res.resultCode === RESPONSE.INVALID_ACCESS_TOKEN) {
        // if (res.error?.code === ERR_CODE.PASSWORD_DUPLICATE) {
        //   this.resetPasswordModuleComponent.isPasswordDuplicate = true;
        // } else if (res.error?.code === ERR_CODE.PASSWORD_NOT_MATCH) {
        //   this.resetPasswordModuleComponent.isPasswordInvalid = true;
        // } else if (res.error?.code === ERR_CODE.ACCOUNT_INACTIVE) {
        //   this.closeModal();
        //   this.handleFailAccountUnavailable();
        // }
      } else if (res.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
      } else {
        this.closeModalResetPassword();
        this.handleFailResponse();
      }
    } catch (error) {
      console.error('Response error', error);
    }
    this.isLoadingReset = false;
    loader.complete();
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
      subtitle: 'คุณต้องการยืนยันการเปลี่ยนรหัสผ่านหรือไม่? การคลิก ยืนยัน <br>จะพาคุณไปยังหน้าการเปลี่ยนรหัสผ่าน คลิก ยกเลิก เพื่อออก',
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

  private handleSuccessResetPassword() {
    this.modalCommonService.open({
      type: 'success',
      title: 'การรีเซ็ตรหัสผ่านเสร็จสมบูรณ์',
      subtitle: 'การรีเซ็ตรหัสผ่านเสร็จสมบูรณ์แล้ว กรุณาใช้รหัสผ่านใหม่ของคุณในการเข้าสู่ระบบ',
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
