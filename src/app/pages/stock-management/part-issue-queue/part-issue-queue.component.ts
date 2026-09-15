import { Component, OnInit } from '@angular/core';

import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { IBaseResponse } from '../../../shared/interface/base-http.interface';
import { IPartIssue } from '../../../shared/interface/repair-flow.interface';
import { PartIssueService } from '../../../shared/services/part-issue.service';

type IssueFilter = 'OPEN' | 'ALL' | IPartIssue['status'];

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
  searchTerm = '';
  activeFilter: IssueFilter = 'OPEN';
  selectedIssue: IPartIssue | null = null;
  isIssueModalOpen = false;
  processRemark = '';
  isCancelModalOpen = false;
  cancelTarget: IPartIssue | null = null;
  cancelRemark = '';
  issueQuantities: Record<string, Record<string, number>> = {};

  readonly filters: Array<{ value: IssueFilter; label: string }> = [
    { value: 'OPEN', label: 'งานที่ต้องทำ' },
    { value: 'ALL', label: 'ทั้งหมด' },
    { value: 'REQUESTED', label: 'รอจอง' },
    { value: 'RESERVED', label: 'พร้อมจ่าย' },
    { value: 'PARTIAL', label: 'เบิกบางส่วน' },
    { value: 'ISSUED', label: 'จ่ายครบแล้ว' },
    { value: 'CANCELLED', label: 'ยกเลิก' },
  ];

  constructor(
    private readonly partIssueService: PartIssueService,
    private readonly modalCommonService: ModalCommonService,
  ) {}

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
      this.issues = response.resultData.data;
    } catch (error) {
      console.error('Failed to load part issue queue:', error);
      this.errorMessage = 'ไม่สามารถโหลดคิวเบิกอะไหล่ได้';
    } finally {
      this.isLoading = false;
    }
  }

  get visibleIssues(): IPartIssue[] {
    const keyword = this.searchTerm.trim().toLowerCase();

    return this.issues.filter((issue) => {
      const matchesFilter = this.activeFilter === 'ALL'
        || (this.activeFilter === 'OPEN' && issue.status !== 'ISSUED' && issue.status !== 'CANCELLED')
        || issue.status === this.activeFilter;
      if (!matchesFilter) return false;
      if (!keyword) return true;

      return [
        issue.issueNo,
        issue.workOrderNo,
        issue.taskNo,
        issue.quotationNo,
        issue.requestedByName,
        ...issue.items.map((item) => `${item.sku} ${item.productName}`),
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword));
    }).sort((left, right) => this.statusPriority(left.status) - this.statusPriority(right.status));
  }

  filterCount(filter: IssueFilter): number {
    if (filter === 'ALL') return this.issues.length;
    if (filter === 'OPEN') return this.actionableCount;
    return this.issues.filter((issue) => issue.status === filter).length;
  }

  private statusPriority(status: IPartIssue['status']): number {
    return { REQUESTED: 1, RESERVED: 2, PARTIAL: 3, ISSUED: 4, CANCELLED: 5 }[status];
  }

  get actionableCount(): number {
    return this.issues.filter((issue) => issue.status !== 'ISSUED' && issue.status !== 'CANCELLED').length;
  }

  get requestedCount(): number {
    return this.issues.filter((issue) => issue.status === 'REQUESTED').length;
  }

  get readyToIssueCount(): number {
    return this.issues.filter((issue) => issue.status === 'RESERVED' || this.hasReservedItems(issue)).length;
  }

  statusLabel(status: IPartIssue['status']): string {
    return {
      REQUESTED: 'รอ Store จองอะไหล่',
      RESERVED: 'จองแล้ว · พร้อมจ่าย',
      PARTIAL: 'เบิกบางส่วน',
      ISSUED: 'จ่ายครบแล้ว',
      CANCELLED: 'ยกเลิกแล้ว',
    }[status];
  }

  statusClass(status: IPartIssue['status']): string {
    return {
      REQUESTED: 'bg-amber-50 text-amber-700 ring-amber-200',
      RESERVED: 'bg-sky-50 text-sky-700 ring-sky-200',
      PARTIAL: 'bg-violet-50 text-violet-700 ring-violet-200',
      ISSUED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      CANCELLED: 'bg-slate-100 text-slate-500 ring-slate-200',
    }[status];
  }

  totalQuantity(issue: IPartIssue, key: 'requestedQty' | 'reservedQty' | 'issuedQty'): number {
    return issue.items.reduce((total, item) => total + item[key], 0);
  }

  hasReservedItems(issue: IPartIssue): boolean {
    return issue.items.some((item) => item.reservedQty > 0);
  }

  canReserve(issue: IPartIssue): boolean {
    return issue.status !== 'ISSUED' && issue.status !== 'CANCELLED' && issue.items.some(
      (item) => item.requestedQty > item.reservedQty + item.issuedQty,
    );
  }

  async reserve(issue: IPartIssue): Promise<void> {
    await this.runAction(
      issue.issueNo,
      () => this.partIssueService.reserve(issue.issueNo),
      'จองอะไหล่สำเร็จ',
    );
  }

  openIssueModal(issue: IPartIssue): void {
    if (!this.hasReservedItems(issue)) {
      this.showFeedback('error', 'ยังจ่ายอะไหล่ไม่ได้', 'กรุณาจองอะไหล่ก่อน แล้วจึงยืนยันการจ่าย');
      return;
    }

    this.selectedIssue = issue;
    this.processRemark = '';
    this.issueQuantities[issue.issueNo] = {};
    issue.items.forEach((item) => {
      if (item.reservedQty > 0) {
        this.issueQuantities[issue.issueNo][item.productId] = item.reservedQty;
      }
    });
    this.isIssueModalOpen = true;
  }

  closeIssueModal(): void {
    if (!this.actionIssueNo) {
      this.isIssueModalOpen = false;
      this.selectedIssue = null;
    }
  }

  getIssueQuantity(issue: IPartIssue, productId: string): number {
    return this.issueQuantities[issue.issueNo]?.[productId] ?? 0;
  }

  setIssueQuantity(issue: IPartIssue, productId: string, value: number): void {
    this.issueQuantities[issue.issueNo] ??= {};
    this.issueQuantities[issue.issueNo][productId] = Number(value);
  }

  async submitIssue(): Promise<void> {
    const issue = this.selectedIssue;
    if (!issue) return;

    const items = issue.items
      .map((item) => ({
        productId: item.productId,
        issuedQty: this.getIssueQuantity(issue, item.productId),
      }))
      .filter((item) => item.issuedQty > 0);

    const invalid = items.some((item) => {
      const source = issue.items.find((issueItem) => issueItem.productId === item.productId);
      return !Number.isInteger(item.issuedQty) || item.issuedQty > (source?.reservedQty ?? 0);
    });

    if (!items.length || invalid) {
      this.showFeedback('error', 'จำนวนไม่ถูกต้อง', 'จำนวนที่จ่ายต้องเป็นจำนวนเต็มและไม่เกินจำนวนที่จองไว้');
      return;
    }

    const completed = await this.runAction(
      issue.issueNo,
      () => this.partIssueService.issue(issue.issueNo, {
        items,
        remark: this.processRemark.trim() || undefined,
      }),
      'ยืนยันจ่ายอะไหล่สำเร็จ',
    );
    if (completed) this.closeIssueModal();
  }

  openCancelModal(issue: IPartIssue): void {
    this.cancelTarget = issue;
    this.cancelRemark = '';
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    if (!this.actionIssueNo) {
      this.isCancelModalOpen = false;
      this.cancelTarget = null;
      this.cancelRemark = '';
    }
  }

  async cancelIssue(): Promise<void> {
    const issue = this.cancelTarget;
    const remark = this.cancelRemark.trim();
    if (!issue || !remark) return;

    const completed = await this.runAction(
      issue.issueNo,
      () => this.partIssueService.cancel(issue.issueNo, remark),
      'ยกเลิกคำขอเบิกแล้ว',
    );
    if (completed) this.closeCancelModal();
  }

  private async runAction(
    issueNo: string,
    action: () => Promise<IBaseResponse<IPartIssue>>,
    successMessage: string,
  ): Promise<boolean> {
    this.actionIssueNo = issueNo;
    this.errorMessage = '';
    try {
      const response = await action();
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถดำเนินการกับคำขอเบิกได้';
        this.showFeedback('error', 'ดำเนินการไม่สำเร็จ', this.errorMessage);
        return false;
      }
      await this.loadIssues();
      this.showFeedback('success', successMessage, `เอกสาร ${issueNo} ถูกบันทึกในระบบแล้ว`);
      return true;
    } catch (error) {
      console.error('Failed to process part issue:', error);
      this.errorMessage = 'ไม่สามารถดำเนินการกับคำขอเบิกได้';
      this.showFeedback('error', 'ดำเนินการไม่สำเร็จ', this.errorMessage);
      return false;
    } finally {
      this.actionIssueNo = '';
    }
  }

  private showFeedback(type: 'success' | 'error', title: string, subtitle: string): void {
    this.modalCommonService.open({
      type,
      title,
      subtitle,
      buttonText: 'เข้าใจแล้ว',
      height: '18rem',
    });
  }
}
