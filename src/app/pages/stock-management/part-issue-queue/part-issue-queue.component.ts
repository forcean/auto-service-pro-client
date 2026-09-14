import { Component, OnInit } from '@angular/core';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { IPartIssue } from '../../../shared/interface/repair-flow.interface';
import { PartIssueService } from '../../../shared/services/part-issue.service';

@Component({
  selector: 'app-part-issue-queue',
  standalone: false,
  templateUrl: './part-issue-queue.component.html',
  styleUrl: './part-issue-queue.component.scss',
})
export class PartIssueQueueComponent implements OnInit {
  issues: IPartIssue[] = [];
  isLoading = true;
  actionIssueNo = '';
  errorMessage = '';

  constructor(private readonly partIssueService: PartIssueService) {}

  ngOnInit(): void {
    void this.loadIssues();
  }

  async loadIssues(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const response = await this.partIssueService.getList({ page: 1, limit: 100 });
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถโหลดคิวเบิกอะไหล่ได้';
        return;
      }
      this.issues = response.resultData.data.filter((issue) => issue.status !== 'ISSUED' && issue.status !== 'CANCELLED');
    } catch (error) {
      console.error('Failed to load part issue queue:', error);
      this.errorMessage = 'ไม่สามารถโหลดคิวเบิกอะไหล่ได้';
    } finally {
      this.isLoading = false;
    }
  }

  async reserve(issue: IPartIssue): Promise<void> {
    await this.runAction(issue.issueNo, () => this.partIssueService.reserve(issue.issueNo));
  }

  async confirmIssue(issue: IPartIssue): Promise<void> {
    const items = issue.items
      .filter((item) => item.reservedQty > 0)
      .map((item) => ({ productId: item.productId, issuedQty: item.reservedQty }));
    if (!items.length) {
      this.errorMessage = 'กรุณาจองอะไหล่ก่อนยืนยันจ่าย';
      return;
    }
    await this.runAction(issue.issueNo, () => this.partIssueService.issue(issue.issueNo, { items }));
  }

  private async runAction(issueNo: string, action: () => Promise<{ resultCode: string; developerMessage?: string }>): Promise<void> {
    this.actionIssueNo = issueNo;
    this.errorMessage = '';
    try {
      const response = await action();
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถดำเนินการกับคำขอเบิกได้';
        return;
      }
      await this.loadIssues();
    } catch (error) {
      console.error('Failed to process part issue:', error);
      this.errorMessage = 'ไม่สามารถดำเนินการกับคำขอเบิกได้';
    } finally {
      this.actionIssueNo = '';
    }
  }
}
