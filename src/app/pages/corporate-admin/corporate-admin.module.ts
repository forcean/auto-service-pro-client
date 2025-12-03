import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CorporateAdminListComponent } from './corporate-admin-list/corporate-admin-list.component';
import { CorporateAdminRoutingModule } from './corporate-admin-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortableDirective } from "../../shared/directive/sortable.directive";
import { FormCreateUserComponent } from './form-create-user/form-create-user.component';



@NgModule({
  declarations: [
    CorporateAdminListComponent,
    FormCreateUserComponent
  ],
  imports: [
    CommonModule,
    CorporateAdminRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SortableDirective
  ]
})
export class CorporateAdminModule { }
