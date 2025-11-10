import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonLayoutPagesComponent } from './common-layout-pages.component';
import { CommonLayoutPagesRoutingModule } from './common-layout-pages-routing.module';
import { LandingComponent } from './landing/landing.component';
import { HeaderComponent } from './template/header/header.component';
import { FooterComponent } from './template/footer/footer.component';
import { SidebarComponent } from './template/sidebar/sidebar.component';
import { SharedModule } from '../shared/shared.module';
import { LucideAngularModule, Menu } from 'lucide-angular';



@NgModule({
  declarations: [
    CommonLayoutPagesComponent,
    LandingComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent
  ],
  imports: [
    CommonModule,
    CommonLayoutPagesRoutingModule,
    SharedModule,
    LucideAngularModule.pick({ Menu }),

  ]
})
export class CommonLayoutPagesModule { }
