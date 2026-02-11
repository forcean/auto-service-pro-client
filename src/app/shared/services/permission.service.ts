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

  isViewUserList: boolean = false;
  isResetPassword: boolean = false;
  isDeleteUser: boolean = false;
  isCreateUser: boolean = false;
  isUpdateUser: boolean = false;

  isViewUserDetail: boolean = false;

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
        console.log('not-found');

        return this;
      } else if (respPermission.resultCode !== RESPONSE.SUCCESS) {
        console.log('error');
        return this;
      }
      const permissions = respPermission.resultData.permissions;
      this.permissionsList = respPermission.resultData.permissions;

      this.isViewUserList = permissions.includes('view:list-users');
      this.isResetPassword = permissions.includes('reset:user-password');
      this.isDeleteUser = permissions.includes('delete:user-account');
      this.isCreateUser = permissions.includes('create:user');
      this.isUpdateUser = permissions.includes('update:user');
      this.isViewUserDetail = permissions.includes('view:user');

    } catch (error) {
      throw error;
      // return this
    }
    return this;
  }

  getMatchingPermission(propertyName: string): string | null { // map property name to permission key setBodyMaskLog
    const permissionMapping: { [key: string]: string } = {
      'isViewUserList': 'view:list-users',
      'isResetPassword': 'reset:user-password',
      'isDeleteUser': 'delete:user-account',
      'isCreateUser': 'create:user',
      'isUpdateUser': 'update:user',
      'isViewUserDetail': 'view:user',
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
