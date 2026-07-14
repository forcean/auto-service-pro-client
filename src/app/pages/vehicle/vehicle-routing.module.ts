import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { ServiceHistoryComponent } from './service-history/service-history.component';

const routes: Routes = [
  {
    path: '',
    component: VehicleListComponent,
  },
  {
    path: 'create',
    component: VehicleFormComponent,
  },
  {
    path: ':id',
    component: VehicleDetailComponent,
  },
  {
    path: ':id/edit',
    component: VehicleFormComponent,
  },
  {
    path: ':id/service-history',
    component: ServiceHistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }
