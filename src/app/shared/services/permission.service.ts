import { Injectable } from '@angular/core';
import { UserService } from './user.service';

import { Router } from '@angular/router';
import { HandleTokenService } from '../../core/services/handle-token-service/handle-token.service';
import { RESPONSE } from '../enum/response.enum';
import { IMenu } from '../interface/sidebar.interface';
import { ROLE } from '../enum/role.enum';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  permissionsList!: string[];

  isViewUser = false;
  isEditCorps = false;
  isEditCharge = false;
  isEditUserCAA = false;
  isEditUserCSA = false;
  isEditUserCA = false;
  isEditUserCU = false;
  isResetPasswordCSA = false;
  isResetPasswordCA = false;
  isResetPasswordCU = false;
  isExportUser = false;
  isCreateAdmin = false;
  isCreateUser = false;
  isCreateUserCAA = false;
  isViewSummaryDashboard = false;
  isViewCampaignOverviewDashboard = false;
  isViewCampaignDetailDashboard = false;
  isViewUserCAA = false;
  isViewSender = false;
  isViewCampaign = false;
  isEditCampaign = false;
  isExportCampaign = false;
  isCreateCampaign = false;
  isDeleteCampaign = false;
  isSmsWebCampaign = false;
  isViewAdminSender = false;
  isDeleteAdminSender = false;
  isCreateSender = false;
  isGrantSender = false;
  isDeleteSender = false;
  isResetPasswordCAA = false;
  isViewUserManagement = false;
  isViewPhonebookContacts = false;
  isExportPhonebookContacts = false;
  isCreatePhonebookContacts = false;
  isDeletePhonebookContacts = false;
  isViewPhonebookGroups = false;
  isExportPhonebookGroups = false;
  isCreatePhonebookGroups = false;
  isDeletePhonebookGroups = false;
  isUpdateGroupContacts = false;
  isViewBlacklist = false;
  isExportBlacklist = false;
  isDeleteBlacklist = false;
  isCreateBlacklist = false;
  isViewPhonebookManagement = false;
  isGrantPhonebookManagement = false;
  isEditPhonebookContacts = false;
  isViewSummaryUsageReport = false;
  isViewDetailReport = false;
  isViewProfile = false;
  isEditProfile = false;
  isViewRestoreGroups = false;
  isViewRestoreContacts = false;
  isActiveCA = false;
  isActiveCU = false;
  isViewFaq = false;

  constructor(
    private userService: UserService,
    private handleTokenService: HandleTokenService,
    private router: Router,
  ) { }

  async permissions() {
    try {
      const respPermission = await this.userService.getUserPermission();
      if (respPermission.resultCode === RESPONSE.INVALID_PERMISSION) {
        this.router.navigate(['/not-found']);
        return this;
      } else if (respPermission.resultCode !== RESPONSE.SUCCESS) {
        return this;
      }
      const permissions = respPermission.resultData.permissions;
      this.permissionsList = respPermission.resultData.permissions;

      this.isViewUser = permissions.includes('view:user');
      this.isViewUserManagement = permissions.includes('view:user-management');
      this.isEditUserCAA = permissions.includes('edit:user-caa');
      this.isEditUserCSA = permissions.includes('edit:user-csa');
      this.isEditUserCA = permissions.includes('edit:user-ca');
      this.isEditUserCU = permissions.includes('edit:user-cu');
      this.isEditCorps = permissions.includes('edit:corps');

      this.isResetPasswordCAA = permissions.includes('resetpassword:user-caa');
      this.isResetPasswordCSA = permissions.includes('resetpassword:user-csa');
      this.isResetPasswordCA = permissions.includes('resetpassword:user-ca');
      this.isResetPasswordCU = permissions.includes('resetpassword:user-cu');
      this.isExportUser = permissions.includes('export:users');
      this.isCreateAdmin = permissions.includes('create:user-ca');
      this.isCreateUser = permissions.includes('create:user-cu');

      this.isViewSummaryDashboard = permissions.includes('view:summary-dashboard');
      this.isViewCampaignOverviewDashboard = permissions.includes('view:campaign-overview-dashboard');
      this.isViewCampaignDetailDashboard = permissions.includes('view:campaign-detail-dashboard');

      this.isViewUserCAA = permissions.includes('view:corps');
      this.isCreateUserCAA = permissions.includes('create:user-caa');
      this.isEditCharge = permissions.includes('edit:charge');

      this.isViewAdminSender = permissions.includes('view:admin-sender-name');
      this.isDeleteAdminSender = permissions.includes('delete:admin-sender-name');
      this.isViewSender = permissions.includes('view:sender-name');
      this.isCreateSender = permissions.includes('create:sender-name');
      this.isGrantSender = permissions.includes('grant:sender-name');
      this.isDeleteSender = permissions.includes('delete:sender-name');

      this.isViewCampaign = permissions.includes('view:campaigns');
      this.isEditCampaign = permissions.includes('edit:campaigns');
      this.isExportCampaign = permissions.includes('export:campaigns');
      this.isCreateCampaign = permissions.includes('create:campaigns');
      this.isDeleteCampaign = permissions.includes('delete:campaigns');
      this.isSmsWebCampaign = permissions.includes('campaign:smsweb');

      this.isViewPhonebookContacts = permissions.includes('view:phonebook-contacts');
      this.isExportPhonebookContacts = permissions.includes('export:phonebook-contacts');
      this.isCreatePhonebookContacts = permissions.includes('create:phonebook-contacts');
      this.isDeletePhonebookContacts = permissions.includes('delete:phonebook-contacts');
      this.isEditPhonebookContacts = permissions.includes('edit:phonebook-contacts');

      this.isViewPhonebookGroups = permissions.includes('view:phonebook-groups');
      this.isExportPhonebookGroups = permissions.includes('export:phonebook-groups');
      this.isCreatePhonebookGroups = permissions.includes('create:phonebook-groups');
      this.isDeletePhonebookGroups = permissions.includes('delete:phonebook-groups');
      this.isUpdateGroupContacts = permissions.includes('update:group-contacts');

      this.isViewBlacklist = permissions.includes('view:blacklist-number');
      this.isExportBlacklist = permissions.includes('export:blacklist-number');
      this.isDeleteBlacklist = permissions.includes('delete:blacklist-number');
      this.isCreateBlacklist = permissions.includes('create:blacklist-number');

      this.isViewPhonebookManagement = permissions.includes('view:phonebook-management');
      this.isGrantPhonebookManagement = permissions.includes('grant:phonebook');

      this.isViewSummaryUsageReport = permissions.includes('view:summary-usage-report');
      this.isViewDetailReport = permissions.includes('view:detail-report');

      this.isViewProfile = permissions.includes('view:profile');
      this.isEditProfile = permissions.includes('edit:profile');

      this.isViewFaq = permissions.includes('view:faq');

      this.isViewRestoreContacts = permissions.includes('restore:phonebook-contacts');
      this.isViewRestoreGroups = permissions.includes('restore:phonebook-groups');

      this.isActiveCA = permissions.includes('active:user-ca');
      this.isActiveCU = permissions.includes('active:user-cu');
    } catch (error) {
      throw error;
      // return this
    }
    return this;
  }

  getMatchingPermission(propertyName: string): string | null { // map property name to permission key setBodyMaskLog
    const permissionMapping: { [key: string]: string } = {
      'isViewUser': 'view:user',
      'isViewUserManagement': 'view:user-management',
      'isEditUserCAA': 'edit:user-caa',
      'isEditUserCSA': 'edit:user-csa',
      'isEditUserCA': 'edit:user-ca',
      'isEditUserCU': 'edit:user-cu',
      'isEditCorps': 'edit:corps',
      'isResetPasswordCAA': 'resetpassword:user-caa',
      'isResetPasswordCSA': 'resetpassword:user-csa',
      'isResetPasswordCA': 'resetpassword:user-ca',
      'isResetPasswordCU': 'resetpassword:user-cu',
      'isExportUser': 'export:users',
      'isCreateAdmin': 'create:user-ca',
      'isCreateUser': 'create:user-cu',
      'isViewSummaryDashboard': 'view:summary-dashboard',
      'isViewCampaignOverviewDashboard': 'view:campaign-overview-dashboard',
      'isViewCampaignDetailDashboard': 'view:campaign-detail-dashboard',
      'isViewUserCAA': 'view:corps',
      'isCreateUserCAA': 'create:user-caa',
      'isEditCharge': 'edit:charge',
      'isViewAdminSender': 'view:admin-sender-name',
      'isDeleteAdminSender': 'delete:admin-sender-name',
      'isViewSender': 'view:sender-name',
      'isCreateSender': 'create:sender-name',
      'isGrantSender': 'grant:sender-name',
      'isDeleteSender': 'delete:sender-name',
      'isViewCampaign': 'view:campaigns',
      'isEditCampaign': 'edit:campaigns',
      'isExportCampaign': 'export:campaigns',
      'isCreateCampaign': 'create:campaigns',
      'isViewPhonebookContacts': 'view:phonebook-contacts',
      'isExportPhonebookContacts': 'export:phonebook-contacts',
      'isCreatePhonebookContacts': 'create:phonebook-contacts',
      'isDeletePhonebookContacts': 'delete:phonebook-contacts',
      'isEditPhonebookContacts': 'edit:phonebook-contacts',
      'isViewPhonebookGroups': 'view:phonebook-groups',
      'isExportPhonebookGroups': 'export:phonebook-groups',
      'isCreatePhonebookGroups': 'create:phonebook-groups',
      'isDeletePhonebookGroups': 'delete:phonebook-groups',
      'isUpdateGroupContacts': 'update:group-contacts',
      'isViewBlacklist': 'view:blacklist-number',
      'isExportBlacklist': 'export:blacklist-number',
      'isDeleteBlacklist': 'delete:blacklist-number',
      'isCreateBlacklist': 'create:blacklist-number',
      'isViewPhonebookManagement': 'view:phonebook-management',
      'isGrantPhonebookManagement': 'grant:phonebook',
      'isViewSummaryUsageReport': 'view:summary-usage-report',
      'isViewDetailReport': 'view:detail-report',
      'isViewProfile': 'view:profile',
      'isEditProfile': 'edit:profile',
      'isViewFaq': 'view:faq',
      'isViewRestoreContacts': 'restore:phonebook-contacts',
      'isViewRestoreGroups': 'restore:phonebook-groups'
    };

    return permissionMapping[propertyName] || null;
  }

  async checkPermission(routePath: string) { // check permission for permission guard
    try {
      await this.permissions();
      const resMenu = await this.userService.getMenu();
      const permission = this.permissionsList;
      const menus = resMenu.resultData.menus;
      let endPoint = `/${routePath.split('/')[2]}/${routePath.split('/')[3]}`;

      if (!routePath.split('/')[3]) {
        endPoint = `/${routePath.split('/')[2]}`;
      }

      const allEndpoints = this.getAllEndpoint(menus);
      const getEndPoint = allEndpoints.find(f => f.endpoint === endPoint);

      return getEndPoint ? permission.includes(getEndPoint.key) : false;
    } catch (err) {
      return this;
    }
  }

  private getAllEndpoint(menuItems: IMenu[]) {
    const allEndpoints = menuItems.flatMap(item => {
      const childrenEndpoints = item.children.map(child => child);
      return [item, ...childrenEndpoints];
    });
    return allEndpoints.filter(f => f !== null);
  }

  checkUserPermission(permissionKey: string): boolean {  //check active user permission
    const userRole = this.handleTokenService.getRole();
    const childRole = userRole === ROLE.MNG ? ROLE.MEC : userRole === ROLE.ADM ? ROLE.MEC : ROLE.MNG;
    const normalizedRole = childRole.toLowerCase();
    const requiredPermission = `${permissionKey}-${normalizedRole}`;

    return this.permissionsList.includes(requiredPermission);
  }
}
