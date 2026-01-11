import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutPagesComponent } from './common-layout-pages.component';
import { LandingComponent } from './landing/landing.component';
import { AuthGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutPagesComponent,
    children: [
      {
        path: 'landing',
        component: LandingComponent
      },
      {
        path: 'corporate-admin',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./corporate-admin/corporate-admin.module').then((m) => m.CorporateAdminModule);
          } catch (error) {
            throw new Error('Failed to load CorporateAdminModule');
          }
        }
      },
      {
        path: 'stock-management',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./stock-management/stock-management.module').then((m) => m.StockManagementModule);
          } catch (error) {
            throw new Error('Failed to load StockManagementModule');
          }
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonLayoutPagesRoutingModule { }
