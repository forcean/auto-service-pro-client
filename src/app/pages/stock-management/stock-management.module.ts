import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockManagementRoutingModule } from './stock-management-routing.module';
import { PartTransactionComponent } from './part-transaction/part-transaction.component';
import { PartIssueQueueComponent } from './part-issue-queue/part-issue-queue.component';
import { SharedModule } from '../../shared/shared.module';
import { LucideAngularModule, PackagePlus } from 'lucide-angular';

@NgModule({
  declarations: [PartTransactionComponent, PartIssueQueueComponent],
  imports: [
    CommonModule,
    StockManagementRoutingModule,
    SharedModule,
    LucideAngularModule.pick({
      PackagePlus,
    }),
  ],
})
export class StockManagementModule {}
