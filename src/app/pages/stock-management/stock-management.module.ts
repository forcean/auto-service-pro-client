import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockManagementRoutingModule } from './stock-management-routing.module';
import { ProductListComponent } from './products/product-list/product-list.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ProductListComponent
  ],
  imports: [
    CommonModule,
    StockManagementRoutingModule,
    SharedModule
  ]
})
export class StockManagementModule { }
