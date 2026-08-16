import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderComponent } from './work-order/work-order.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';

const routes: Routes = [
  { 
    path: 'work-orders', 
    component: WorkOrderComponent 
  },
  { 
    path: 'work-orders/:id', 
    component: WorkOrderDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepairManagementRoutingModule {}
