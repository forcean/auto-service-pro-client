import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartTransactionComponent } from './part-transaction/part-transaction.component';

const routes: Routes = [
  {
    path: 'part-transaction',
    component: PartTransactionComponent,
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockManagementRoutingModule { }
