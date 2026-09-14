import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { IProducts } from '../../../shared/interface/product-list.interface';
import { ETaskPriority, ETaskStatus, IPartIssue, IQuotationPartAvailability, IUpdateTaskRequest, IWorkOrderTask } from '../../../shared/interface/repair-flow.interface';
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

type PartRequestMode = 'QUOTED' | 'COMPLIMENTARY' | 'CHARGED';

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
  quotationParts: IQuotationPartAvailability[] = [];
  selectedPartTask: IWorkOrderTask | null = null;
  selectedProduct: IProducts | null = null;
  selectedQuotationPart: IQuotationPartAvailability | null = null;
  loadedIssue: IPartIssue | null = null;
  isLoadingTasks = false;
  isLoadingMechanics = false;
  isSearchingProducts = false;
  isLoadingQuotationParts = false;
  isSubmitting = false;
  feedback = '';
  productSearch = '';
  partRequestMode: PartRequestMode = 'QUOTED';
  reworkTitle = '';
  partIssueCancelRemark = '';
  additionalProblemText: Record<string, string> = {};
  editingTaskNo: string | null = null;

  taskForm = {
    title: '',
    description: '',
    priority: ETaskPriority.NORMAL,
    estimateMinute: 0,
    actualMinute: 0,
    plannedStartDate: '',
    plannedFinishDate: '',
    remark: '',
    mechanicIds: [] as string[],
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

  get selectedMechanics(): UserList[] {
    return this.mechanics.filter((mechanic) => this.taskForm.mechanicIds.includes(mechanic.id));
  }

  get taskSummary(): string {
    const finished = this.tasks.filter((task) => task.status === ETaskStatus.FINISHED).length;
    return `${finished}/${this.tasks.length} งานเสร็จแล้ว`;
  }

  get editingTask(): IWorkOrderTask | null {
    return this.tasks.find((task) => task.taskNo === this.editingTaskNo) ?? null;
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
    const mechanics = this.selectedMechanics;
    if (!this.taskForm.title.trim() || !mechanics.length) {
      this.setFeedback('กรุณาระบุชื่องานและเลือกช่างผู้รับผิดชอบอย่างน้อย 1 คน');
      return;
    }
    await this.runAction(async () => {
      const response = await this.taskService.createTask({
        workOrderNo: this.workOrder.workOrderNo,
        title: this.taskForm.title.trim(),
        description: this.taskForm.description.trim() || undefined,
        priority: this.taskForm.priority,
        estimateMinute: Number(this.taskForm.estimateMinute) || undefined,
        actualMinute: Number(this.taskForm.actualMinute) || undefined,
        plannedStartDate: this.taskForm.plannedStartDate || undefined,
        plannedFinishDate: this.taskForm.plannedFinishDate || undefined,
        remark: this.taskForm.remark.trim() || undefined,
        mechanics: mechanics.map((mechanic) => ({
          mechanicId: mechanic.id,
          mechanicName: [mechanic.firstname, mechanic.lastname].filter(Boolean).join(' ') || mechanic.publicId,
        })),
        isRework: this.workOrder.status === EWorkOrderStatus.REWORK,
      });
      if (response.resultCode !== RESPONSE.SUCCESS) return response;
      return this.taskService.updateStatus(response.resultData.taskNo, ETaskStatus.ASSIGNED);
    }, 'สร้างและมอบหมายงานให้ช่างแล้ว');
    this.taskForm = {
      title: '',
      description: '',
      priority: ETaskPriority.NORMAL,
      estimateMinute: 0,
      actualMinute: 0,
      plannedStartDate: '',
      plannedFinishDate: '',
      remark: '',
      mechanicIds: [],
    };
  }

  async updateTaskStatus(task: IWorkOrderTask, nextStatus: ETaskStatus): Promise<void> {
    await this.runAction(() => this.taskService.updateStatus(task.taskNo, nextStatus), 'อัปเดตสถานะงานแล้ว');
  }

  startEditTask(task: IWorkOrderTask): void {
    this.editingTaskNo = task.taskNo;
  }

  cancelEditTask(): void {
    this.editingTaskNo = null;
  }

  async saveTaskEdit(form: IUpdateTaskRequest): Promise<void> {
    const task = this.editingTask;
    const title = form.title?.trim();
    if (!task) {
      this.setFeedback('ไม่พบ Task ที่กำลังแก้ไข กรุณารีเฟรชข้อมูล');
      return;
    }
    if (!title) {
      this.setFeedback('กรุณาระบุชื่องาน');
      return;
    }
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    try {
      const response = await this.taskService.updateTask(task.taskNo, {
        ...form,
        title,
        description: form.description?.trim() || undefined,
        estimateMinute: Number(form.estimateMinute) || 0,
        actualMinute: Number(form.actualMinute) || 0,
        progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
        plannedStartDate: form.plannedStartDate || undefined,
        plannedFinishDate: form.plannedFinishDate || undefined,
        remark: form.remark?.trim() || undefined,
      });
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.setFeedback(this.errorMessage(response));
        return;
      }
      this.setFeedback('บันทึกการแก้ไขงานแล้ว', false);
      this.cancelEditTask();
      await this.loadTasks();
      this.flowChanged.emit();
    } catch {
      this.setFeedback('ไม่สามารถบันทึกการแก้ไขงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      this.isSubmitting = false;
    }
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

  async approveAdditionalProblem(task: IWorkOrderTask, problemId: string): Promise<void> {
    const quotationId = this.workOrder.currentQuotationId;
    if (!quotationId) {
      this.setFeedback('ไม่พบใบเสนอราคาใหม่สำหรับยืนยันงานเพิ่ม');
      return;
    }
    await this.runAction(
      () => this.taskService.approveAdditionalProblem(task.taskNo, problemId, { quotationId }),
      'อนุมัติงานเพิ่มแล้ว สร้าง Task ใหม่ให้ทีมดำเนินการต่อได้',
    );
  }

  openParts(task: IWorkOrderTask): void {
    this.selectedPartTask = task;
    this.selectedProduct = null;
    this.productSearch = '';
    this.productResults = [];
    this.loadedIssue = null;
    this.selectedQuotationPart = null;
    this.partRequestMode = 'QUOTED';
    this.partForm = { requestedQty: 1, isAdditionalCharge: false, remark: '' };
    void this.loadQuotationParts();
  }

  closeParts(): void {
    this.selectedPartTask = null;
    this.selectedProduct = null;
    this.productResults = [];
    this.quotationParts = [];
    this.selectedQuotationPart = null;
  }

  setPartRequestMode(mode: PartRequestMode): void {
    this.partRequestMode = mode;
    this.selectedQuotationPart = null;
    this.selectedProduct = null;
    this.productSearch = '';
    this.productResults = [];
    this.partForm.requestedQty = 1;
  }

  async loadQuotationParts(): Promise<void> {
    const quotationId = this.workOrder.currentQuotationId;
    if (!quotationId) {
      this.setFeedback('ไม่พบใบเสนอราคาที่อ้างอิงได้สำหรับการขอเบิกอะไหล่');
      return;
    }
    this.isLoadingQuotationParts = true;
    try {
      const response = await this.partIssueService.getQuotationPartAvailability(quotationId);
      this.quotationParts = response.resultCode === RESPONSE.SUCCESS ? response.resultData.items : [];
      if (response.resultCode !== RESPONSE.SUCCESS) this.setFeedback(this.errorMessage(response));
    } catch {
      this.setFeedback('ไม่สามารถโหลดรายการอะไหล่จากใบเสนอราคาได้');
    } finally {
      this.isLoadingQuotationParts = false;
    }
  }

  selectQuotationPart(part: IQuotationPartAvailability): void {
    this.selectedQuotationPart = part;
    this.partForm.requestedQty = 1;
  }

  async searchProducts(keywordValue?: string): Promise<void> {
    if (keywordValue !== undefined) this.productSearch = keywordValue;
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
    if (!this.selectedPartTask || !this.selectedQuotationPart) {
      this.setFeedback('เลือกงานและอะไหล่ก่อนสร้างใบเบิก');
      return;
    }
    if (!this.workOrder.currentQuotationId) {
      this.setFeedback('ไม่พบใบเสนอราคาที่อ้างอิงได้สำหรับการขอเบิกอะไหล่');
      return;
    }
    const quotationId = this.workOrder.currentQuotationId;
    const part = this.selectedQuotationPart;
    const isChargedAdditional = this.isChargedAdditionalTask(this.selectedPartTask);
    const requestedQty = Number(this.partForm.requestedQty);
    if (!Number.isInteger(requestedQty) || requestedQty < 1 || requestedQty > part.availableQty) {
      this.setFeedback(`จำนวนที่ขอเบิกต้องอยู่ระหว่าง 1 ถึง ${part.availableQty}`);
      return;
    }
    await this.runAction(async () => {
      const response = await this.partIssueService.create({
        workOrderNo: this.workOrder.workOrderNo,
        taskNo: this.selectedPartTask!.taskNo,
        quotationId,
        remark: this.partForm.remark.trim() || undefined,
        items: [{
          productId: part.productId,
          sku: part.sku,
          productName: part.productName,
          requestedQty,
          reason: isChargedAdditional ? 'ADDITIONAL' : 'NORMAL',
          isAdditionalCharge: isChargedAdditional,
          unitPrice: part.unitPrice,
        }],
      });
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.loadedIssue = response.resultData;
        await this.loadQuotationParts();
      }
      return response;
    }, 'สร้างใบเบิกอะไหล่แล้ว', false);
  }

  async createComplimentaryAdditionalIssue(): Promise<void> {
    if (!this.selectedPartTask || !this.selectedProduct) {
      this.setFeedback('ค้นหาและเลือกอะไหล่ที่ต้องการเบิกเพิ่มก่อน');
      return;
    }
    const quotationId = this.workOrder.currentQuotationId;
    if (!quotationId) {
      this.setFeedback('ไม่พบใบเสนอราคาที่ APPROVED สำหรับอ้างอิงการเบิก');
      return;
    }
    const requestedQty = this.validAdditionalQuantity();
    if (!requestedQty) return;
    const product = this.selectedProduct;
    await this.runAction(async () => {
      const response = await this.partIssueService.create({
        workOrderNo: this.workOrder.workOrderNo,
        taskNo: this.selectedPartTask!.taskNo,
        quotationId,
        remark: this.partForm.remark.trim() || undefined,
        items: [{
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          requestedQty,
          reason: 'ADDITIONAL',
          isAdditionalCharge: false,
          unitPrice: this.productUnitPrice(product),
          remark: this.partForm.remark.trim() || undefined,
        }],
      });
      if (response.resultCode === RESPONSE.SUCCESS) this.loadedIssue = response.resultData;
      return response;
    }, 'ส่งคำขอเบิกอะไหล่เพิ่มแบบไม่คิดค่าใช้จ่ายให้ Store แล้ว', false);
  }

  async beginChargedAdditionalFlow(): Promise<void> {
    if (!this.selectedPartTask || !this.selectedProduct) {
      this.setFeedback('ค้นหาและเลือกอะไหล่ที่ต้องการเสนอราคาเพิ่มก่อน');
      return;
    }
    const requestedQty = this.validAdditionalQuantity();
    if (!requestedQty || this.isSubmitting) return;

    const task = this.selectedPartTask;
    const product = this.selectedProduct;
    const detail = `ต้องใช้อะไหล่เพิ่มเติม (คิดค่าใช้จ่าย): ${product.sku} ${product.name} จำนวน ${requestedQty} ชิ้น${this.partForm.remark.trim() ? ` — ${this.partForm.remark.trim()}` : ''}`;
    this.isSubmitting = true;
    try {
      const response = await this.taskService.reportAdditionalProblem(task.taskNo, detail);
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.setFeedback(this.errorMessage(response));
        return;
      }
      await this.router.navigate(['/portal/repair/quotation/create'], {
        queryParams: {
          workOrderNo: this.workOrder.workOrderNo,
          additionalTaskNo: task.taskNo,
          additionalProductId: product.id,
          additionalSku: product.sku,
          additionalProductName: product.name,
          additionalQuantity: requestedQty,
          additionalRemark: this.partForm.remark.trim() || undefined,
        },
      });
    } catch {
      this.setFeedback('ไม่สามารถส่งเรื่องขออนุมัติอะไหล่เพิ่มได้');
    } finally {
      this.isSubmitting = false;
    }
  }

  private validAdditionalQuantity(): number | null {
    const requestedQty = Number(this.partForm.requestedQty);
    if (!Number.isInteger(requestedQty) || requestedQty < 1) {
      this.setFeedback('จำนวนที่ขอเบิกต้องเป็นจำนวนเต็มตั้งแต่ 1 ชิ้น');
      return null;
    }
    return requestedQty;
  }

  productUnitPrice(product: IProducts): number {
    return product.prices?.retail ?? product.prices?.wholesale ?? product.prices?.cost ?? 0;
  }

  isChargedAdditionalTask(task: IWorkOrderTask): boolean {
    return task.isRework && task.remark === 'Created from approved additional problem';
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
