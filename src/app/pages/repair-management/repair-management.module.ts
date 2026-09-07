import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepairManagementRoutingModule } from './repair-management-routing.module';
import { WorkOrderComponent } from './work-order/work-order.component';
import { QuotationComponent } from './quotation/quotation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "../../shared/shared.module";
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { QuotationCreateComponent } from './quotation-create/quotation-create.component';

@NgModule({
  declarations: [WorkOrderComponent, QuotationComponent, WorkOrderDetailComponent, QuotationCreateComponent],
  imports: [
    CommonModule,
    RepairManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
],
})
export class RepairManagementModule {}
