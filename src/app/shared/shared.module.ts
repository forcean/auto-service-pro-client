import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ModalCommonComponent } from './components/modal-common/modal-common.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MaskValueComponent } from './components/mask-value/mask-value.component';
import { StrongPasswordInputComponent } from './components/strong-password-input/strong-password-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomOptionComponent } from './components/custom-option/custom-option.component';
import { CustomSelectComponent } from './components/custom-select/custom-select.component';
import { ResetPasswordModuleComponent } from './components/reset-password-modal/reset-password-modal.component';
import { ModalConditionComponent } from './components/modal-condition/modal-condition.component';
import { NumericDirective } from './directive/numeric.directive';
import { PreventSpaceDirective } from './directive/preventspace.directive';
import { TableUserManagementComponent } from './components/table-user-management/table-user-management.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchUserManagementComponent } from './components/search-user-management/search-user-management.component';
import { ContentTitleComponent } from './components/content-title/content-title.component';
import { LazyLoadTableComponent } from './lazy-load/lazy-load-table/lazy-load-table.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CustomCategoryOptionComponent } from './components/custom-category-option/custom-category-option.component';
import { CustomBrandOptionComponent } from './components/custom-brand-option/custom-brand-option.component';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { VehicleStepSelectorComponent } from './components/vehicle-step-selector/vehicle-step-selector.component';
import { VehicleCompatibilityComponent } from './components/vehicle-compatibility/vehicle-compatibility.component';

const components = [
  ModalCommonComponent,
  ProfileComponent,
  MaskValueComponent,
  StrongPasswordInputComponent,
  CustomOptionComponent,
  CustomSelectComponent,
  ResetPasswordModuleComponent,
  ModalConditionComponent,
  NumericDirective,
  PreventSpaceDirective,
  TableUserManagementComponent,
  PaginationComponent,
  SearchUserManagementComponent,
  ContentTitleComponent,
  LazyLoadTableComponent,
  ProductCardComponent,
  ProductFilterComponent,
  FileUploadComponent,
  CustomCategoryOptionComponent,
  CustomBrandOptionComponent,
  VehicleCardComponent,
  VehicleStepSelectorComponent,
  VehicleCompatibilityComponent,
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ...components,
  ]
})
export class SharedModule { }
