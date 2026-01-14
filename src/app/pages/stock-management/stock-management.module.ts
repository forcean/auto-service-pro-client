import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockManagementRoutingModule } from './stock-management-routing.module';
import { ProductListComponent } from './products/product-list/product-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ProductCreateComponent } from './products/product-create/product-create.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ProductListComponent,
    ProductCreateComponent
  ],
  imports: [
    CommonModule,
    StockManagementRoutingModule,
    SharedModule,
    ReactiveFormsModule
  ]
})
export class StockManagementModule { }
