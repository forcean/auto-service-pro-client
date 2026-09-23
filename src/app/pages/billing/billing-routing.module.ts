import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillingWorkspaceComponent } from './billing-workspace/billing-workspace.component';

const routes: Routes = [{ path: '', component: BillingWorkspaceComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingRoutingModule {}
