import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ModalCommonComponent } from './components/modal-common/modal-common.component';

const components = [
  ModalCommonComponent
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
  ]
})
export class SharedModule { }
