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
  id: string = 'a8302982083274568923423845234759';

  onCreate() {
    this.router.navigate(['/portal/corporate-admin/account/create']);
  }
  onDetail() {
    this.router.navigate(['/portal/corporate-admin/account/detail', this.id], {
      state: {
        user: {
          username: 'john_doe',
          firstname: 'John',
          lastname: 'Doe',
          email: 'test@gmail.com',
          phoneNumber: '0987654321',
          role: 'ACC',
          managerId: null,
          createdDate: '2023-10-01T12:00:00Z'
        }
      }
    });
  }
}
