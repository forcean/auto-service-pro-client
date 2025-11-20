import { ChangeDetectorRef, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { HeaderComponent } from './template/header/header.component';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-common-layout-pages',
  standalone: false,
  templateUrl: './common-layout-pages.component.html',
  styleUrl: './common-layout-pages.component.scss'
})
export class CommonLayoutPagesComponent {
  isMinibar = true;
  isUseOffcanvas = false;
  isSidebarOverlayOpen = false;

  @ViewChild(HeaderComponent) headerComponent!: HeaderComponent;
  @ViewChild('mainContent', { static: false }) mainContent!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
      }
    });
  }

  ngOnInit() { }

  onSidebarToggled(isMinibar: boolean) {
    this.isMinibar = isMinibar;
    if (!isMinibar) {
      this.isSidebarOverlayOpen = true;
    } else {
      this.isSidebarOverlayOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkWindowSize();
  }

  private checkWindowSize() {
    if (window.innerWidth <= 800) {
      this.isUseOffcanvas = true;
      this.isMinibar = true;
    } else {
      this.isUseOffcanvas = false;
    }
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.checkWindowSize();
    window.dispatchEvent(new Event('resize'));
  }

  scrollToTop() {
    const element = document.querySelector('.main-content');
    if (element) {
      element.scrollTo(0, 0);
    }
  }

  scrollToBottom() {
    if (this.mainContent) {
      this.mainContent.nativeElement.scrollTo({
        top: this.mainContent.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isSidebarOverlayOpen && target.classList.contains('sidebar-backdrop')) {
      this.isMinibar = true;
      this.isSidebarOverlayOpen = false;
    }
  }
}
