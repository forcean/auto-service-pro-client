import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { IProducts } from '../../../shared/interface/product-list.interface';
import { ETaskPriority, ETaskStatus, IPartIssue, IWorkOrderTask } from '../../../shared/interface/repair-flow.interface';
import { UserList } from '../../../shared/interface/table-user-management.interface';
import { IWorkOrder } from '../../../shared/interface/work-order.interface';
import { PartIssueService } from '../../../shared/services/part-issue.service';
import { ProductService } from '../../../shared/services/product.service';
import { TaskService } from '../../../shared/services/task.service';
import { UserManagementService } from '../../../shared/services/user-management.service';
import { WorkOrderService } from '../../../shared/services/work-order.service';

interface IWorkflowStep {
  label: string;
  shortLabel: string;
}

interface ITaskBoardColumn {
  label: string;
  hint: string;
  statuses: ETaskStatus[];
  accentClass: string;
}

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
  readonly workflowSteps: IWorkflowStep[] = [
    { label: 'รับรถและตรวจเช็ค', shortLabel: 'ตรวจเช็ค' },
    { label: 'เสนอราคา', shortLabel: 'เสนอราคา' },
    { label: 'มอบหมายทีม', shortLabel: 'มอบหมาย' },
    { label: 'ดำเนินการซ่อม', shortLabel: 'ซ่อม' },
    { label: 'ตรวจสอบคุณภาพ', shortLabel: 'QC' },
    { label: 'QC ผ่าน', shortLabel: 'ผ่าน' },
  ];
  readonly taskBoardColumns: ITaskBoardColumn[] = [
    {
      label: 'รอมอบหมาย',
      hint: 'Waiting',
      statuses: [ETaskStatus.WAITING],
      accentClass: 'border-slate-200 bg-slate-50',
    },
    {
      label: 'พร้อมเริ่มงาน',
      hint: 'Assigned / paused',
      statuses: [ETaskStatus.ASSIGNED, ETaskStatus.PAUSED],
      accentClass: 'border-indigo-200 bg-indigo-50/60',
    },
    {
      label: 'กำลังดำเนินการ',
      hint: 'In progress',
      statuses: [ETaskStatus.IN_PROGRESS],
      accentClass: 'border-amber-200 bg-amber-50/60',
    },
    {
      label: 'ตรวจและเสร็จงาน',
      hint: 'QC / done',
      statuses: [ETaskStatus.QUALITY_CHECK, ETaskStatus.FINISHED, ETaskStatus.CANCELLED],
      accentClass: 'border-emerald-200 bg-emerald-50/60',
    },
  ];

  tasks: IWorkOrderTask[] = [];
  mechanics: UserList[] = [];
  productResults: IProducts[] = [];
  selectedPartTask: IWorkOrderTask | null = null;
  selectedProduct: IProducts | null = null;
  loadedIssue: IPartIssue | null = null;
  isLoadingTasks = false;
  isLoadingMechanics = false;
  isSearchingProducts = false;
  isSubmitting = false;
  feedback = '';
  productSearch = '';
  reworkTitle = '';
  partIssueCancelRemark = '';
  additionalProblemText: Record<string, string> = {};

  taskForm = {
    title: '',
    description: '',
    priority: ETaskPriority.NORMAL,
    estimateMinute: 0,
    mechanicId: '',
  };
  partForm = { requestedQty: 1, isAdditionalCharge: false, remark: '' };

  constructor(
    private readonly workOrderService: WorkOrderService,
    private readonly taskService: TaskService,
    private readonly partIssueService: PartIssueService,
    private readonly productService: ProductService,
    private readonly userManagementService: UserManagementService,
    private readonly router: Router,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workOrder']?.currentValue?.workOrderNo) {
      void this.refreshWorkspace();
    }
  }

  get currentStageIndex(): number {
    switch (this.workOrder.status) {
      case EWorkOrderStatus.OPEN:
      case EWorkOrderStatus.INSPECTING:
        return 0;
      case EWorkOrderStatus.WAITING_QUOTATION:
      case EWorkOrderStatus.WAITING_APPROVAL:
        return 1;
      case EWorkOrderStatus.WAITING_ASSIGNMENT:
        return 2;
      case EWorkOrderStatus.IN_PROGRESS:
      case EWorkOrderStatus.WAITING_ADDITIONAL_APPROVAL:
      case EWorkOrderStatus.REWORK:
        return 3;
      case EWorkOrderStatus.WAITING_QC:
        return 4;
      case EWorkOrderStatus.QC_APPROVED:
        return 5;
      default:
        return 0;
    }
  }

  get selectedMechanic(): UserList | undefined {
    return this.mechanics.find((mechanic) => mechanic.id === this.taskForm.mechanicId);
  }

  get taskSummary(): string {
    const finished = this.tasks.filter((task) => task.status === ETaskStatus.FINISHED).length;
    return `${finished}/${this.tasks.length} งานเสร็จแล้ว`;
  }

  tasksForColumn(column: ITaskBoardColumn): IWorkOrderTask[] {
    return this.tasks.filter((task) => column.statuses.includes(task.status));
  }

  taskStatusLabel(status: ETaskStatus): string {
    const labels: Record<ETaskStatus, string> = {
      [ETaskStatus.WAITING]: 'รอมอบหมาย',
      [ETaskStatus.ASSIGNED]: 'พร้อมเริ่ม',
      [ETaskStatus.IN_PROGRESS]: 'กำลังทำ',
      [ETaskStatus.QUALITY_CHECK]: 'รอตรวจ',
      [ETaskStatus.PAUSED]: 'พักงาน',
      [ETaskStatus.FINISHED]: 'เสร็จแล้ว',
      [ETaskStatus.CANCELLED]: 'ยกเลิก',
    };

    return labels[status];
  }

  isStepActive(index: number): boolean {
    return index <= this.currentStageIndex;
  }

  async refreshWorkspace(): Promise<void> {
    await Promise.all([this.loadTasks(), this.loadMechanics()]);
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

  async loadMechanics(): Promise<void> {
    if (![EWorkOrderStatus.WAITING_ASSIGNMENT, EWorkOrderStatus.REWORK].includes(this.workOrder.status)) return;
    this.isLoadingMechanics = true;
    try {
      const response = await this.userManagementService.getListUser({ page: 1, limit: 100, role: 'MEC' });
      this.mechanics = response.resultCode === RESPONSE.SUCCESS
        ? response.resultData.users.filter((user) => user.activeFlag)
        : [];
    } catch {
      this.mechanics = [];
    } finally {
      this.isLoadingMechanics = false;
    }
  }

  async moveWorkOrder(status: EWorkOrderStatus): Promise<boolean> {
    if (this.isSubmitting) return false;
    this.isSubmitting = true;
    try {
      const response = await this.workOrderService.updateWorkOrderStatus(this.workOrder.workOrderNo, status);
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.setFeedback(this.errorMessage(response));
        return false;
      }
      this.setFeedback('อัปเดตขั้นตอนงานแล้ว', false);
      this.flowChanged.emit();
      return true;
    } catch {
      this.setFeedback('ไม่สามารถอัปเดตขั้นตอนงานได้');
      return false;
    } finally {
      this.isSubmitting = false;
    }
  }

  openQuotation(create = false): void {
    void this.router.navigate(
      [create ? '/portal/repair/quotation/create' : '/portal/repair/quotation'],
      create ? { queryParams: { workOrderNo: this.workOrder.workOrderNo } } : undefined,
    );
  }

  async createTask(): Promise<void> {
    const mechanic = this.selectedMechanic;
    if (!this.taskForm.title.trim() || !mechanic) {
      this.setFeedback('กรุณาระบุชื่องานและเลือกช่างผู้รับผิดชอบ');
      return;
    }
    await this.runAction(async () => {
      const response = await this.taskService.createTask({
        workOrderNo: this.workOrder.workOrderNo,
        title: this.taskForm.title.trim(),
        description: this.taskForm.description.trim() || undefined,
        priority: this.taskForm.priority,
        estimateMinute: Number(this.taskForm.estimateMinute) || undefined,
        mechanics: [{
          mechanicId: mechanic.id,
          mechanicName: [mechanic.firstname, mechanic.lastname].filter(Boolean).join(' ') || mechanic.publicId,
        }],
        isRework: this.workOrder.status === EWorkOrderStatus.REWORK,
      });
      if (response.resultCode !== RESPONSE.SUCCESS) return response;
      return this.taskService.updateStatus(response.resultData.taskNo, ETaskStatus.ASSIGNED);
    }, 'สร้างและมอบหมายงานให้ช่างแล้ว');
    this.taskForm = { title: '', description: '', priority: ETaskPriority.NORMAL, estimateMinute: 0, mechanicId: '' };
  }

  async updateTaskStatus(task: IWorkOrderTask, nextStatus: ETaskStatus): Promise<void> {
    await this.runAction(() => this.taskService.updateStatus(task.taskNo, nextStatus), 'อัปเดตสถานะงานแล้ว');
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
      this.setFeedback('กรุณาระบุรายละเอียดปัญหาที่พบเพิ่ม');
      return;
    }
    await this.runAction(() => this.taskService.reportAdditionalProblem(task.taskNo, description), 'ส่งเรื่องขออนุมัติงานเพิ่มแล้ว');
    this.additionalProblemText[task.taskNo] = '';
  }

  openParts(task: IWorkOrderTask): void {
    this.selectedPartTask = task;
    this.selectedProduct = null;
    this.productSearch = '';
    this.productResults = [];
    this.loadedIssue = null;
  }

  closeParts(): void {
    this.selectedPartTask = null;
    this.selectedProduct = null;
    this.productResults = [];
  }

  async searchProducts(): Promise<void> {
    const keyword = this.productSearch.trim();
    if (!keyword) {
      this.productResults = [];
      return;
    }
    this.isSearchingProducts = true;
    try {
      const response = await this.productService.getListProduct({ page: 1, limit: 10, sku: keyword });
      this.productResults = response.resultCode === RESPONSE.SUCCESS ? response.resultData.products : [];
    } catch {
      this.productResults = [];
    } finally {
      this.isSearchingProducts = false;
    }
  }

  selectProduct(product: IProducts): void {
    this.selectedProduct = product;
    this.productResults = [];
    this.productSearch = product.sku;
  }

  async createPartIssue(): Promise<void> {
    if (!this.selectedPartTask || !this.selectedProduct) {
      this.setFeedback('เลือกงานและอะไหล่ก่อนสร้างใบเบิก');
      return;
    }
    const product = this.selectedProduct;
    await this.runAction(async () => {
      const response = await this.partIssueService.create({
        workOrderNo: this.workOrder.workOrderNo,
        taskNo: this.selectedPartTask!.taskNo,
        remark: this.partForm.remark.trim() || undefined,
        items: [{
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          requestedQty: Number(this.partForm.requestedQty),
          reason: this.partForm.isAdditionalCharge ? 'ADDITIONAL' : 'NORMAL',
          isAdditionalCharge: this.partForm.isAdditionalCharge,
          unitPrice: product.prices?.retail ?? 0,
        }],
      });
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'สร้างใบเบิกอะไหล่แล้ว', false);
  }

  async reservePartIssue(): Promise<void> {
    if (!this.loadedIssue) return;
    await this.runPartIssueAction(() => this.partIssueService.reserve(this.loadedIssue!.issueNo), 'จองอะไหล่แล้ว');
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
    await this.runPartIssueAction(() => this.partIssueService.issue(this.loadedIssue!.issueNo, { items }), 'ตัดสต็อกและจ่ายอะไหล่แล้ว');
  }

  async cancelPartIssue(): Promise<void> {
    if (!this.loadedIssue || !this.partIssueCancelRemark.trim()) {
      this.setFeedback('กรุณาระบุเหตุผลก่อนยกเลิกใบเบิก');
      return;
    }
    await this.runPartIssueAction(
      () => this.partIssueService.cancel(this.loadedIssue!.issueNo, this.partIssueCancelRemark.trim()),
      'ยกเลิกใบเบิกอะไหล่แล้ว',
    );
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
    this.setFeedback('ส่งกลับแก้ไขแล้ว เลือกช่างและมอบหมายงานแก้ไขต่อได้', false);
  }

  private async runPartIssueAction(
    action: () => Promise<{ resultCode: string; resultData: IPartIssue; developerMessage?: string }>,
    successMessage: string,
  ): Promise<void> {
    await this.runAction(async () => {
      const response = await action();
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, successMessage, false);
  }

  private async runAction<T extends { resultCode: string; resultData: unknown; developerMessage?: string; error?: { message: string } }>(
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
