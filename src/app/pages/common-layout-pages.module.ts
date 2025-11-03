import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonLayoutPagesComponent } from './common-layout-pages.component';
import { CommonLayoutPagesRoutingModule } from './common-layout-pages-routing.module';
import { LandingComponent } from './landing/landing.component';



@NgModule({
  declarations: [
    CommonLayoutPagesComponent,
    LandingComponent
  ],
  imports: [
    CommonModule,
    CommonLayoutPagesRoutingModule
  ]
})
export class CommonLayoutPagesModule { }
