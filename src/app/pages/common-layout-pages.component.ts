import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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

  @ViewChild('mainContent', { static: false }) mainContent!: ElementRef;

  constructor(
    private router: Router
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.scrollToTop();
        this.closeSidebar();
      }
    });
  }

  ngOnInit(): void {
    this.checkWindowSize();
  }

  onSidebarToggled(isMinibar: boolean): void {
    this.isMinibar = isMinibar;
    this.isSidebarOverlayOpen = !isMinibar;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkWindowSize();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  closeSidebar(): void {
    this.isMinibar = true;
    this.isSidebarOverlayOpen = false;
  }

  private checkWindowSize(): void {
    this.isUseOffcanvas = window.innerWidth < 1024;
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

}
