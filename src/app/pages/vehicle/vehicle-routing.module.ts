import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleRoutingModule { }
