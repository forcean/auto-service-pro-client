import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IAvailableMenu, IMenu, IResponseMenu } from '../../../shared/interface/sidebar.interface';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserService } from '../../../shared/services/user.service';
import { MaskValueService } from '../../../shared/components/mask-value/mask-value.service';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isMinibar = false;
  @Output() miniBarToggled = new EventEmitter<boolean>();
  @ViewChild('menuList') menuList!: ElementRef

  availableMenus!: IAvailableMenu
  expands: Record<string, boolean> = {};
  menus: IResponseMenu = {
    role: '',
    menus: []
  }

  private callBackUrl: string = '';

  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private loadingBarService: LoadingBarService,
    private modalCommonService: ModalCommonService,
    private maskValueService: MaskValueService,

  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.callBackUrl = params['callBackUrl'] || '';
    })
    await this.getMenus()
    this.handleDefaultExpand()
  }

  private async getMenus() {
    const loader = this.loadingBarService.useRef();
    loader.start();

    try {
      const respMenus = await this.userService.getMenu()
      if (respMenus.resultCode === RESPONSE.SUCCESS) {
        this.menus = respMenus.resultData;
        const allEndpoints = this.getAllEndpoint(respMenus.resultData.menus);
        this.maskValueService.setAllEndpoints(allEndpoints);
        if (this.callBackUrl !== '' && allEndpoints.some(s => this.callBackUrl.includes(s.endpoint))) {
          this.router.navigateByUrl(this.callBackUrl);
        } else if (this.callBackUrl !== '' && !allEndpoints.some(s => this.callBackUrl.includes(s.endpoint)) && !this.callBackUrl.includes('report-download')) {
          this.router.navigate(['portal', 'landing']);
        } else if (this.callBackUrl.includes('report-download')) {
          this.router.navigateByUrl(this.callBackUrl);
        }
        this.callBackUrl = '';
      } else {
        this.handleCommonError();
      }
    } catch (error) {
      console.log(error);
    }
    finally {
      loader.complete();
    }
  }

  private handleDefaultExpand() {
    for (const menu of this.menus.menus) {
      if (menu.endpoint && this.router.url.includes(menu.endpoint)) {
        this.expands[menu.key] = true
      }
      for (const child of menu.children) {
        if (this.router.url.includes(child.endpoint)) {
          this.expands[menu.key] = true
          break
        }
      }
    }
  }

  navigate(url: string) {
    // this.sessionIdService.newTransactionId()
    this.router.navigate(['portal' + url]);
    if (window.innerWidth <= 800) {
      this.isMinibar = true;
    }
    this.isMinibar = true;
    this.miniBarToggled.emit(this.isMinibar);
  }

  isActiveParentMenu(menu: any): boolean {
    if (menu.endpoint && this.isActiveMenu(menu.endpoint)) {
      return true
    }
    for (const child of menu.children) {
      if (this.isActiveMenu(child.endpoint)) {
        return true
      }
    }
    return false
  }

  isActiveMenu(endpoint: string) {
    return this.router.url.includes(endpoint)
  }

  isShowExpand(key: string) {
    if (this.isMinibar) {
      return
    }
    this.expands[key] = !this.expands[key]
  }

  handleMiniBarToggle() {
    if (this.isMinibar) {
      this.isMinibar = false
      this.miniBarToggled.emit(this.isMinibar)
    }
  }

  private getAllEndpoint(menuItems: IMenu[]) {
    const allEndpoints = menuItems.flatMap(item => {
      const childrenEndpoints = item.children.map(child => child);
      return [item, ...childrenEndpoints];
    });
    return allEndpoints.filter(f => f.endpoint !== null);
  }

  private handleCommonError() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });
  }
}
