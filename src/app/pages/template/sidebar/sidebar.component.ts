import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

interface SidebarMenu {
  key: string;
  displayName: string;
  endpoint?: string;
  icon: string;
  children?: SidebarMenu[];
}
@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isMinibar = false;
  @Output() miniBarToggled = new EventEmitter<boolean>();

  expands: Record<string, boolean> = {};

  menus: SidebarMenu[] = [
    {
      key: 'home',
      displayName: 'Home',
      endpoint: '/home',
      icon: 'assets/img/menu/home.svg',
    },
    {
      key: 'corp',
      displayName: 'Corporate Management',
      icon: 'assets/img/menu/corp.svg',
      children: [
        { key: 'corp-1', displayName: 'List', endpoint: '/corp/list', icon: '' },
        { key: 'corp-2', displayName: 'Add Corporate', endpoint: '/corp/add', icon: '' },
      ],
    },
    {
      key: 'sender',
      displayName: 'Sender Name Management',
      icon: 'assets/img/menu/sender.svg',
      children: [
        { key: 'sender-1', displayName: 'Registered', endpoint: '/sender/registered', icon: '' },
        { key: 'sender-2', displayName: 'Requests', endpoint: '/sender/request', icon: '' },
      ],
    },
    {
      key: 'faq',
      displayName: 'FAQ',
      endpoint: '/faq',
      icon: 'assets/img/menu/faq.svg',
    },
    {
      key: 'guide',
      displayName: 'Guidebook',
      endpoint: '/guidebook',
      icon: 'assets/img/menu/guide.svg',
    },
  ];

  constructor(private router: Router) { }

  navigate(url?: string) {
    if (!url) return;
    this.router.navigateByUrl(url);
    if (window.innerWidth <= 800) {
      this.isMinibar = true;
      this.miniBarToggled.emit(this.isMinibar);
    }
  }

  toggleExpand(key: string) {
    if (this.isMinibar) return;
    this.expands[key] = !this.expands[key];
  }

  isActiveMenu(endpoint?: string): boolean {
    if (!endpoint) return false;
    return this.router.url.includes(endpoint);
  }

  isActiveParentMenu(menu: SidebarMenu): boolean {
    if (menu.endpoint && this.isActiveMenu(menu.endpoint)) return true;
    if (menu.children) {
      return menu.children.some((c) => this.isActiveMenu(c.endpoint));
    }
    return false;
  }
}
