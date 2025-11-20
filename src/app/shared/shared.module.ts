import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ModalCommonComponent } from './components/modal-common/modal-common.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MaskValueComponent } from './components/mask-value/mask-value.component';

const components = [
  ModalCommonComponent,
  ProfileComponent,
  MaskValueComponent
];

@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ],
  exports: [
    ...components,
    ProfileComponent
  ]
})
export class SharedModule { }
