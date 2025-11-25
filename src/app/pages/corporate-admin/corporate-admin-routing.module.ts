import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorporateAdminListComponent } from './corporate-admin-list/corporate-admin-list.component';
import { FormCreateAdminComponent } from './form-create-admin/form-create-admin.component';

const routes: Routes = [
  {
    path: 'account',
    component: CorporateAdminListComponent,
  },
  {
    path: 'account/create',
    component: FormCreateAdminComponent,
  },
  // {
  //   path: 'account/detail/:id',
  //   // component: AdminDetailComponent,
  // },
  // {
  //   path: 'account/edit/:id',
  //   // component: FormEditAdminComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CorporateAdminRoutingModule { }
