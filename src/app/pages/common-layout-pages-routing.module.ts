import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutPagesComponent } from './common-layout-pages.component';
import { LandingComponent } from './landing/landing.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutPagesComponent,
    children: [
      {
        path: 'landing',
        component: LandingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonLayoutPagesRoutingModule { }
