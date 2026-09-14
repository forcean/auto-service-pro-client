import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartTransactionComponent } from './part-transaction/part-transaction.component';
import { PartIssueQueueComponent } from './part-issue-queue/part-issue-queue.component';

const routes: Routes = [
  {
    path: 'part-transaction',
    component: PartTransactionComponent,
  }
  ,{
    path: 'part-issues',
    component: PartIssueQueueComponent,
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockManagementRoutingModule { }
