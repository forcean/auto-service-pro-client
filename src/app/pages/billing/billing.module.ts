import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingWorkspaceComponent } from './billing-workspace/billing-workspace.component';
import { BillingPaymentComponent } from './billing-payment/billing-payment.component';

@NgModule({
  declarations: [BillingWorkspaceComponent, BillingPaymentComponent],
  imports: [CommonModule, FormsModule, SharedModule, BillingRoutingModule],
})
export class BillingModule {}
