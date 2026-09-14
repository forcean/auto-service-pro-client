import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { QuotationCreateComponent } from './quotation-create/quotation-create.component';
import { QuotationComponent } from './quotation/quotation.component';
import { QuotationApprovalComponent } from './quotation-approval/quotation-approval.component';
import { TeamAssignmentComponent } from './team-assignment/team-assignment.component';

const routes: Routes = [
  { 
    path: 'work-orders', 
    component: WorkOrderComponent 
  },
  { 
    path: 'work-orders/:id', 
    component: WorkOrderDetailComponent
  },
  {
    path: 'team-assignment',
    component: TeamAssignmentComponent,
  },
  {
    path: 'team-assignment/:id',
    component: TeamAssignmentComponent,
  },
  { 
    path: 'quotation/create', 
    component: QuotationCreateComponent
  },
  {
    path: 'quotation/:quotationNo/approval',
    component: QuotationApprovalComponent,
  },
  { 
    path: 'quotation', 
    component: QuotationComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepairManagementRoutingModule {}
