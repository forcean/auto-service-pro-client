import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateAdminListComponent } from './corporate-admin-list/corporate-admin-list.component';
import { FormCreateAdminComponent } from './form-create-admin/form-create-admin.component';
import { CorporateAdminRoutingModule } from './corporate-admin-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    CorporateAdminListComponent,
    FormCreateAdminComponent
  ],
  imports: [
    CommonModule,
    CorporateAdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class CorporateAdminModule { }
