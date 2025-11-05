import { Component } from '@angular/core';

@Component({
  selector: 'app-common-layout-pages',
  standalone: false,
  templateUrl: './common-layout-pages.component.html',
  styleUrl: './common-layout-pages.component.scss'
})
export class CommonLayoutPagesComponent {

  isMinibar = false;

  onSidebarToggled(isMinibar: boolean) {
    this.isMinibar = isMinibar;
  }
}
