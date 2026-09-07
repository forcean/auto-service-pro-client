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
        component: LandingComponent,
      },
      {
        path: 'corporate-admin',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./corporate-admin/corporate-admin.module').then(
              (m) => m.CorporateAdminModule,
            );
          } catch (error) {
            throw new Error('Failed to load CorporateAdminModule');
          }
        },
      },
      {
        path: 'product',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./product/product.module').then(
              (m) => m.ProductModule,
            );
          } catch (error) {
            throw new Error('Failed to load StockManagementModule');
          }
        },
      },
      {
        path: 'stock',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./stock-management/stock-management.module').then(
              (m) => m.StockManagementModule,
            );
          } catch (error) {
            throw new Error('Failed to load StockManagementModule');
          }
        },
      },
      {
        path: 'vehicle',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./vehicle/vehicle.module').then(
              (m) => m.VehicleModule,
            );
          } catch (error) {
            throw new Error('Failed to load VehicleModule');
          }
        },
      },
      {
        path: 'repair',
        // canActivate: [AuthGuard],
        loadChildren: async () => {
          try {
            return await import('./repair-management/repair-management.module').then(
              (m) => m.RepairManagementModule,
            );
          } catch (error) {
            throw new Error('Failed to load RepairManagementModule');
          }
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommonLayoutPagesRoutingModule {}
