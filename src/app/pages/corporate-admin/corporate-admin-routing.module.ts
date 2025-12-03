import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorporateAdminListComponent } from './corporate-admin-list/corporate-admin-list.component';
import { FormCreateUserComponent } from './form-create-user/form-create-user.component';

const routes: Routes = [
  {
    path: 'account',
    component: CorporateAdminListComponent,
  },
  {
    path: 'account/create',
    component: FormCreateUserComponent,
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
