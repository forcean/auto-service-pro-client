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
import { WorkOrderFlowComponent } from './work-order-flow/work-order-flow.component';
import { QuotationApprovalComponent } from './quotation-approval/quotation-approval.component';
import { TeamAssignmentComponent } from './team-assignment/team-assignment.component';

@NgModule({
  declarations: [WorkOrderComponent, QuotationComponent, WorkOrderDetailComponent, QuotationCreateComponent, WorkOrderFlowComponent, QuotationApprovalComponent, TeamAssignmentComponent],
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
