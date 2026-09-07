import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { QuotationCreateComponent } from './quotation-create/quotation-create.component';
import { QuotationComponent } from './quotation/quotation.component';

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
    path: 'quotation/create', 
    component: QuotationCreateComponent
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
