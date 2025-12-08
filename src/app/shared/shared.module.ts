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

const components = [
  ModalCommonComponent,
  ProfileComponent,
  MaskValueComponent,
  StrongPasswordInputComponent,
  CustomOptionComponent,
  CustomSelectComponent,
  ResetPasswordModuleComponent,
  ModalConditionComponent
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
    ProfileComponent
  ]
})
export class SharedModule { }
