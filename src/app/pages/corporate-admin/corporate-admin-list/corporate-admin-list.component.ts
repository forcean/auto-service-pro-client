import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-corporate-admin-list',
  standalone: false,
  templateUrl: './corporate-admin-list.component.html',
  styleUrl: './corporate-admin-list.component.scss'
})
export class CorporateAdminListComponent {

  constructor(private router: Router) { }

  onCreate() {
    this.router.navigate(['/portal/corporate-admin/account/create']);
  }
}
