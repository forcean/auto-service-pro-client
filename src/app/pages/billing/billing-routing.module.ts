import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillingWorkspaceComponent } from './billing-workspace/billing-workspace.component';
import { BillingPaymentComponent } from './billing-payment/billing-payment.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: BillingWorkspaceComponent },
  { path: 'payment', component: BillingPaymentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingRoutingModule {}
