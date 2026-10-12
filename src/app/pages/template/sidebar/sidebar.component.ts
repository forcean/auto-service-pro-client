import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IMenu, IResponseMenu } from '../../../shared/interface/sidebar.interface';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserService } from '../../../shared/services/user.service';
import { MaskValueService } from '../../../shared/components/mask-value/mask-value.service';
import { filter, Subscription } from 'rxjs';
import { NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isMinibar = false;
  @Input() closeOnNavigate = false;
  @Output() miniBarToggled = new EventEmitter<boolean>();

  expands: Record<string, boolean> = {};
  menus: IResponseMenu = {
    role: '',
    menus: []
  }

  private callBackUrl: string = '';
  private readonly subscriptions = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute,
    private loadingBarService: LoadingBarService,
    private modalCommonService: ModalCommonService,
    private maskValueService: MaskValueService,

  ) { }

  async ngOnInit(): Promise<void> {
    this.subscriptions.add(this.route.queryParams.subscribe((params) => {
      this.callBackUrl = params['callBackUrl'] || '';
    }));
    this.subscriptions.add(this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(() => {
      this.handleDefaultExpand();
    }));

    await this.getMenus();
    this.handleDefaultExpand();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private handleDefaultExpand(): void {
    for (const menu of this.menus.menus) {
      if (this.isActiveMenu(menu.endpoint)) {
        this.expands[menu.key] = true
      }
      for (const child of menu.children) {
        if (this.isActiveMenu(child.endpoint)) {
          this.expands[menu.key] = true
          break
        }
      }
    }
  }

  navigate(endpoint: string): void {
    if (!endpoint) return;

    const target = endpoint.startsWith('/portal')
      ? endpoint
      : `/portal${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    void this.router.navigateByUrl(target);
    if (this.closeOnNavigate) {
      this.isMinibar = true;
      this.miniBarToggled.emit(this.isMinibar);
    }
  }

  toggleMenu(menu: IMenu): void {
    if (!menu.children.length) {
      this.navigate(menu.endpoint);
      return;
    }

    if (this.isMinibar) {
      this.isMinibar = false;
      this.miniBarToggled.emit(this.isMinibar);
      return;
    }

    this.expands[menu.key] = !this.expands[menu.key];
  }

  isActiveParentMenu(menu: IMenu): boolean {
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

  isActiveMenu(endpoint: string): boolean {
    if (!endpoint) return false;

    const currentUrl = this.router.url.split('?')[0].split('#')[0];
    const target = endpoint.startsWith('/portal')
      ? endpoint
      : `/portal${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    return currentUrl === target || currentUrl.startsWith(`${target}/`);
  }

  isMenuExpanded(menu: IMenu): boolean {
    return !this.isMinibar && (this.expands[menu.key] || this.isActiveParentMenu(menu));
  }

  trackByMenuKey(_: number, menu: IMenu): string {
    return menu.key;
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
