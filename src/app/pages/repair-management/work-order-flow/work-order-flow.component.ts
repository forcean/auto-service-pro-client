import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { IWorkOrder } from '../../../shared/interface/work-order.interface';
import {
  ETaskPriority,
  ETaskStatus,
  IPartIssue,
  IWorkOrderTask,
} from '../../../shared/interface/repair-flow.interface';
import { PartIssueService } from '../../../shared/services/part-issue.service';
import { QuotationService } from '../../../shared/services/quotation.service';
import { TaskService } from '../../../shared/services/task.service';
import { WorkOrderService } from '../../../shared/services/work-order.service';

@Component({
  selector: 'app-work-order-flow',
  standalone: false,
  templateUrl: './work-order-flow.component.html',
  styleUrl: './work-order-flow.component.scss',
})
export class WorkOrderFlowComponent implements OnChanges {
  @Input({ required: true }) workOrder!: IWorkOrder;
  @Output() flowChanged = new EventEmitter<void>();

  readonly statuses = EWorkOrderStatus;
  readonly taskStatuses = ETaskStatus;
  readonly priorities = Object.values(ETaskPriority);

  tasks: IWorkOrderTask[] = [];
  loadedIssue: IPartIssue | null = null;
  issueSearchNo = '';
  partIssueCancelRemark = '';
  isLoadingTasks = false;
  isSubmitting = false;
  feedback = '';

  taskForm = {
    title: '',
    description: '',
    priority: ETaskPriority.NORMAL,
    estimateMinute: 0,
    mechanicId: '',
    mechanicName: '',
  };
  reworkTitle = '';
  quotationNo = '';
  quotationCustomerName = '';
  quotationMethod: 'PHONE' | 'LINE' | 'FACEBOOK' | 'IN_PERSON' = 'PHONE';
  quotationRejectReason = '';
  additionalQuotationIds: Record<string, string> = {};
  additionalTaskTitles: Record<string, string> = {};
  additionalProblemText: Record<string, string> = {};
  partForm = {
    taskNo: '',
    productId: '',
    sku: '',
    productName: '',
    requestedQty: 1,
    unitPrice: 0,
    isAdditionalCharge: false,
    remark: '',
  };

  constructor(
    private readonly workOrderService: WorkOrderService,
    private readonly taskService: TaskService,
    private readonly quotationService: QuotationService,
    private readonly partIssueService: PartIssueService,
    private readonly router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workOrder']?.currentValue?.workOrderNo) {
      void this.loadTasks();
    }
  }

  async loadTasks(): Promise<void> {
    this.isLoadingTasks = true;
    try {
      const response = await this.taskService.getTasks(this.workOrder.workOrderNo);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.tasks = response.resultData.data;
      } else {
        this.setFeedback(this.errorMessage(response));
      }
    } catch {
      this.setFeedback('ไม่สามารถโหลดรายการงานจากระบบได้');
    } finally {
      this.isLoadingTasks = false;
    }
  }

  async moveWorkOrder(status: EWorkOrderStatus): Promise<boolean> {
    if (this.isSubmitting) return false;
    this.isSubmitting = true;
    try {
      const response = await this.workOrderService.updateWorkOrderStatus(
        this.workOrder.workOrderNo,
        status,
      );
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.setFeedback(this.errorMessage(response));
        return false;
      }
      this.setFeedback('อัปเดตสถานะใบสั่งงานแล้ว', false);
      this.flowChanged.emit();
      return true;
    } catch {
      this.setFeedback('ไม่สามารถอัปเดตสถานะใบสั่งงานได้');
      return false;
    } finally {
      this.isSubmitting = false;
    }
  }

  goToQuotation(): void {
    void this.router.navigate(['/portal/repair/quotation/create'], {
      queryParams: { workOrderNo: this.workOrder.workOrderNo },
    });
  }

  async approveQuotation(): Promise<void> {
    if (!this.quotationNo || !this.quotationCustomerName) {
      this.setFeedback('กรุณาระบุเลขที่ใบเสนอราคาและชื่อลูกค้าที่อนุมัติ');
      return;
    }
    await this.runAction(async () => {
      const response = await this.quotationService.approveQuotation(this.quotationNo, {
        method: this.quotationMethod,
        customerName: this.quotationCustomerName,
      });
      return response;
    }, 'บันทึกการอนุมัติใบเสนอราคาแล้ว');
  }

  async rejectQuotation(): Promise<void> {
    if (!this.quotationNo || !this.quotationRejectReason) {
      this.setFeedback('กรุณาระบุเลขที่ใบเสนอราคาและเหตุผลที่ปฏิเสธ');
      return;
    }
    await this.runAction(
      () => this.quotationService.rejectQuotation(this.quotationNo, this.quotationRejectReason),
      'บันทึกการปฏิเสธใบเสนอราคาแล้ว',
    );
  }

  async createQuotationRevision(): Promise<void> {
    if (!this.quotationNo) {
      this.setFeedback('กรุณาระบุเลขที่ใบเสนอราคาที่ต้องการสร้างฉบับแก้ไข');
      return;
    }
    await this.runAction(
      () => this.quotationService.createRevision(this.quotationNo),
      'สร้างใบเสนอราคาฉบับแก้ไขแล้ว',
    );
  }

  async createTask(isRework = false): Promise<void> {
    const form = this.taskForm;
    if (!form.title || !form.mechanicId) {
      this.setFeedback('กรุณาระบุชื่องานและรหัสช่างที่ได้รับมอบหมาย');
      return;
    }
    await this.runAction(async () => {
      const response = await this.taskService.createTask({
        workOrderNo: this.workOrder.workOrderNo,
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        estimateMinute: Number(form.estimateMinute) || undefined,
        mechanics: [{ mechanicId: form.mechanicId, mechanicName: form.mechanicName || undefined }],
        isRework: isRework || this.workOrder.status === EWorkOrderStatus.REWORK,
      });
      if (response.resultCode !== RESPONSE.SUCCESS) return response;
      const assignment = await this.taskService.updateStatus(
        response.resultData.taskNo,
        ETaskStatus.ASSIGNED,
      );
      return assignment.resultCode === RESPONSE.SUCCESS ? response : assignment;
    }, isRework ? 'สร้างงานแก้ไขและมอบหมายช่างแล้ว' : 'สร้างงานและมอบหมายช่างแล้ว');
    this.taskForm = {
      title: '', description: '', priority: ETaskPriority.NORMAL, estimateMinute: 0, mechanicId: '', mechanicName: '',
    };
  }

  async updateTaskStatus(task: IWorkOrderTask, nextStatus: ETaskStatus): Promise<void> {
    await this.runAction(
      () => this.taskService.updateStatus(task.taskNo, nextStatus),
      'อัปเดตสถานะงานแล้ว',
    );
  }

  nextTaskStatus(task: IWorkOrderTask): ETaskStatus | null {
    const transitions: Partial<Record<ETaskStatus, ETaskStatus>> = {
      [ETaskStatus.WAITING]: ETaskStatus.ASSIGNED,
      [ETaskStatus.ASSIGNED]: ETaskStatus.IN_PROGRESS,
      [ETaskStatus.IN_PROGRESS]: ETaskStatus.FINISHED,
      [ETaskStatus.PAUSED]: ETaskStatus.IN_PROGRESS,
      [ETaskStatus.QUALITY_CHECK]: ETaskStatus.FINISHED,
    };
    return transitions[task.status] ?? null;
  }

  taskActionLabel(task: IWorkOrderTask): string {
    const labels: Partial<Record<ETaskStatus, string>> = {
      [ETaskStatus.WAITING]: 'ยืนยันมอบหมาย',
      [ETaskStatus.ASSIGNED]: 'เริ่มงาน',
      [ETaskStatus.IN_PROGRESS]: 'ส่งงานเสร็จ',
      [ETaskStatus.PAUSED]: 'ทำงานต่อ',
      [ETaskStatus.QUALITY_CHECK]: 'ยืนยันงานเสร็จ',
    };
    return labels[task.status] ?? '';
  }

  async reportAdditionalProblem(task: IWorkOrderTask): Promise<void> {
    const description = this.additionalProblemText[task.taskNo]?.trim();
    if (!description) {
      this.setFeedback('กรุณาระบุรายละเอียดปัญหาเพิ่มเติม');
      return;
    }
    await this.runAction(
      () => this.taskService.reportAdditionalProblem(task.taskNo, description),
      'ส่งเรื่องขออนุมัติซ่อมเพิ่มแล้ว',
    );
    this.additionalProblemText[task.taskNo] = '';
  }

  async approveAdditionalProblem(task: IWorkOrderTask, problemId: string): Promise<void> {
    const quotationId = this.additionalQuotationIds[problemId]?.trim();
    if (!quotationId) {
      this.setFeedback('กรุณาระบุ Quotation ID ที่ลูกค้าอนุมัติสำหรับงานเพิ่ม');
      return;
    }
    await this.runAction(
      () => this.taskService.approveAdditionalProblem(task.taskNo, problemId, {
        quotationId,
        title: this.additionalTaskTitles[problemId]?.trim() || undefined,
      }),
      'อนุมัติงานเพิ่มและสร้างงานแก้ไขแล้ว',
    );
  }

  selectTaskForPartIssue(taskNo: string): void {
    this.partForm.taskNo = taskNo;
    this.setFeedback(`กำลังสร้างใบเบิกอะไหล่สำหรับ ${taskNo}`, false);
  }

  async createPartIssue(): Promise<void> {
    const form = this.partForm;
    if (!form.taskNo || !form.productId || !form.sku || !form.productName) {
      this.setFeedback('กรุณาระบุงาน รหัสสินค้า SKU และชื่ออะไหล่ให้ครบ');
      return;
    }
    await this.runAction(async () => {
      const response = await this.partIssueService.create({
        workOrderNo: this.workOrder.workOrderNo,
        taskNo: form.taskNo,
        remark: form.remark || undefined,
        items: [{
          productId: form.productId,
          sku: form.sku,
          productName: form.productName,
          requestedQty: Number(form.requestedQty),
          reason: form.isAdditionalCharge ? 'ADDITIONAL' : 'NORMAL',
          isAdditionalCharge: form.isAdditionalCharge,
          unitPrice: Number(form.unitPrice) || 0,
        }],
      });
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'สร้างใบเบิกอะไหล่แล้ว');
  }

  async findPartIssue(): Promise<void> {
    if (!this.issueSearchNo.trim()) {
      this.setFeedback('กรุณาระบุเลขที่ใบเบิกอะไหล่');
      return;
    }
    await this.runAction(async () => {
      const response = await this.partIssueService.getByIssueNo(this.issueSearchNo.trim());
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'โหลดข้อมูลใบเบิกอะไหล่แล้ว', false);
  }

  async reservePartIssue(): Promise<void> {
    if (!this.loadedIssue) return;
    await this.runAction(async () => {
      const response = await this.partIssueService.reserve(this.loadedIssue!.issueNo);
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'จองอะไหล่แล้ว');
  }

  async issueReservedParts(): Promise<void> {
    if (!this.loadedIssue) return;
    const items = this.loadedIssue.items
      .filter((item) => item.reservedQty > 0)
      .map((item) => ({ productId: item.productId, issuedQty: item.reservedQty }));
    if (!items.length) {
      this.setFeedback('ไม่มีอะไหล่ที่จองไว้เพื่อจ่ายออก');
      return;
    }
    await this.runAction(async () => {
      const response = await this.partIssueService.issue(this.loadedIssue!.issueNo, items);
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'ตัดสต็อกและจ่ายอะไหล่แล้ว');
  }

  async cancelPartIssue(): Promise<void> {
    if (!this.loadedIssue) return;
    if (!this.partIssueCancelRemark.trim()) {
      this.setFeedback('กรุณาระบุเหตุผลที่ยกเลิกใบเบิกอะไหล่');
      return;
    }
    await this.runAction(async () => {
      const response = await this.partIssueService.cancel(
        this.loadedIssue!.issueNo,
        this.partIssueCancelRemark.trim(),
      );
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'ยกเลิกใบเบิกอะไหล่และคืนยอดจองแล้ว');
    this.partIssueCancelRemark = '';
  }

  async failQcAndCreateRework(): Promise<void> {
    if (!this.reworkTitle.trim()) {
      this.setFeedback('กรุณาระบุรายการที่ต้องแก้ไขก่อนส่งกลับเข้าซ่อม');
      return;
    }
    const moved = await this.moveWorkOrder(EWorkOrderStatus.REWORK);
    if (!moved) return;
    this.taskForm.title = this.reworkTitle.trim();
    this.reworkTitle = '';
    this.setFeedback('เปลี่ยนสถานะเป็น REWORK แล้ว กรุณาระบุช่างและมอบหมายงานแก้ไข', false);
  }

  private async runAction<T extends { resultCode: string; resultData: unknown; error?: { message: string } }>(
    action: () => Promise<T>,
    successMessage: string,
    reloadTasks = true,
  ): Promise<void> {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      const response = await action();
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.setFeedback(this.errorMessage(response));
        return;
      }
      this.setFeedback(successMessage, false);
      if (reloadTasks) await this.loadTasks();
      this.flowChanged.emit();
    } catch {
      this.setFeedback('ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      this.isSubmitting = false;
    }
  }

  private errorMessage(response: { developerMessage?: string; error?: { message: string } }): string {
    return response.error?.message || response.developerMessage || 'ทำรายการไม่สำเร็จ';
  }

  private setFeedback(message: string, isError = true): void {
    this.feedback = `${isError ? 'ไม่สำเร็จ: ' : 'สำเร็จ: '}${message}`;
  }
}
