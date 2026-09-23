import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared.module';
import { BillingRoutingModule } from './billing-routing.module';
import { BillingWorkspaceComponent } from './billing-workspace/billing-workspace.component';

@NgModule({
  declarations: [BillingWorkspaceComponent],
  imports: [CommonModule, FormsModule, SharedModule, BillingRoutingModule],
})
export class BillingModule {}
