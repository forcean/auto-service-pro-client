import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertCircle,
  ArrowUpRight,
  Calendar,
  CarFront,
  CheckCircle2,
  Clock,
  List,
  Pencil,
  RefreshCw,
  Search,
  Wrench,
} from 'lucide-angular';
import { Subscription } from 'rxjs';

import { RESPONSE } from '../../../shared/enum/response.enum';
import {
  ETaskPriority,
  ETaskStatus,
  IMyAssignment,
  IMyAssignmentListResult,
  IMyAssignmentQuery,
  IUpdateTaskRequest,
  IWorkOrderTask,
  TMyAssignmentSchedule,
} from '../../../shared/interface/repair-flow.interface';
import { TaskService } from '../../../shared/services/task.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-my-assignment',
  standalone: false,
  templateUrl: './my-assignment.component.html',
  styleUrl: './my-assignment.component.scss',
})
export class MyAssignmentComponent implements OnInit, OnDestroy {
  readonly taskStatuses = ETaskStatus;
  readonly taskPriorities = ETaskPriority;
  readonly paginationOption = [10, 20, 30, 50];
  readonly scheduleOptions: Array<{ value: TMyAssignmentSchedule; label: string }> = [
    { value: 'ALL', label: 'ทุกกำหนดการ' },
    { value: 'OVERDUE', label: 'เลยกำหนด' },
    { value: 'TODAY', label: 'ครบกำหนดวันนี้' },
    { value: 'UPCOMING', label: 'กำลังจะถึงกำหนด' },
    { value: 'UNSCHEDULED', label: 'ยังไม่กำหนด' },
  ];
  readonly statusTabs: Array<{ value: ETaskStatus | ''; label: string }> = [
    { value: '', label: 'งานที่ยังเปิดอยู่' },
    { value: ETaskStatus.ASSIGNED, label: 'พร้อมเริ่ม' },
    { value: ETaskStatus.IN_PROGRESS, label: 'กำลังทำ' },
    { value: ETaskStatus.PAUSED, label: 'ติดปัญหา' },
    { value: ETaskStatus.QUALITY_CHECK, label: 'รอตรวจ QC' },
    { value: ETaskStatus.FINISHED, label: 'เสร็จแล้ว' },
  ];

  readonly IconTask = List;
  readonly IconWrench = Wrench;
  readonly IconCalendar = Calendar;
  readonly IconAlert = AlertCircle;
  readonly IconClock = Clock;
  readonly IconRefresh = RefreshCw;
  readonly IconSearch = Search;
  readonly IconCar = CarFront;
  readonly IconCheck = CheckCircle2;
  readonly IconArrow = ArrowUpRight;
  readonly IconPencil = Pencil;

  keyword = '';
  status: ETaskStatus | '' = '';
  priority: ETaskPriority | '' = '';
  schedule: TMyAssignmentSchedule = 'ALL';
  page = 1;
  limit = 20;
  assignments: IMyAssignmentListResult = {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    data: [],
  };
  isLoading = false;
  updatingTaskNo = '';
  feedback = '';
  feedbackIsError = false;

  editingTask: IWorkOrderTask | null = null;
  isTaskModalOpen = false;
  isSubmittingTaskModal = false;

  private querySubscription?: Subscription;
  private latestRequestId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly taskService: TaskService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.querySubscription = this.route.queryParams.subscribe((params) => {
      this.keyword = String(params['keyword'] ?? '');
      this.status = this.isTaskStatus(params['status']) ? params['status'] : '';
      this.priority = this.isTaskPriority(params['priority']) ? params['priority'] : '';
      this.schedule = this.isSchedule(params['schedule']) ? params['schedule'] : 'ALL';
      this.page = this.readPositiveNumber(params['page'], 1);
      this.limit = this.readPositiveNumber(params['limit'], 20);
      void this.loadAssignments();
    });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }

  openEditModal(task: IMyAssignment): void {
    this.editingTask = task;
    this.isTaskModalOpen = true;
  }

  closeTaskModal(): void {
    this.isTaskModalOpen = false;
    this.editingTask = null;
  }

  async onSaveTaskModal(body: IUpdateTaskRequest): Promise<void> {
    if (!this.editingTask || this.isSubmittingTaskModal) return;
    this.isSubmittingTaskModal = true;
    try {
      const response = await this.taskService.updateTask(this.editingTask.taskNo, body);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.toastService.success('อัปเดตรายละเอียด Task เรียบร้อยแล้ว');
        this.closeTaskModal();
        await this.loadAssignments();
      } else {
        const errorMsg = response.developerMessage || 'ไม่สามารถอัปเดต Task ได้';
        this.toastService.error(errorMsg);
        this.setFeedback(errorMsg, true);
      }
    } catch {
      const errorMsg = 'เกิดข้อผิดพลาดในการบันทึก Task กรุณาลองใหม่อีกครั้ง';
      this.toastService.error(errorMsg);
      this.setFeedback(errorMsg, true);
    } finally {
      this.isSubmittingTaskModal = false;
    }
  }

  get inProgressCount(): number {
    return this.assignments.data.filter((task) => task.status === ETaskStatus.IN_PROGRESS).length;
  }

  get urgentCount(): number {
    return this.assignments.data.filter((task) => task.priority === ETaskPriority.URGENT || this.isOverdue(task)).length;
  }

  onSearch(): void {
    this.page = 1;
    this.updateUrl();
  }

  onFilterChange(): void {
    this.page = 1;
    this.updateUrl();
  }

  selectStatus(status: ETaskStatus | ''): void {
    if (this.status === status) return;
    this.status = status;
    this.onFilterChange();
  }

  resetFilters(): void {
    this.keyword = '';
    this.status = '';
    this.priority = '';
    this.schedule = 'ALL';
    this.page = 1;
    this.updateUrl();
  }

  refresh(): void {
    void this.loadAssignments();
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    this.page = event.page;
    this.limit = event.pageSize;
    this.updateUrl();
  }

  openWorkspace(task: IMyAssignment): void {
    void this.router.navigate(['/portal/repair/team-assignment', task.workOrderNo]);
  }

  async advanceTask(task: IMyAssignment): Promise<void> {
    const nextStatus = this.nextStatus(task.status);
    if (!nextStatus || this.updatingTaskNo) return;
    this.updatingTaskNo = task.taskNo;
    try {
      const response = await this.taskService.updateStatus(task.taskNo, nextStatus);
      if (response.resultCode === RESPONSE.SUCCESS) {
        const message = this.actionSuccessMessage(nextStatus);
        this.toastService.success(message);
        await this.loadAssignments();
      } else {
        const errorMsg = response.developerMessage || 'ไม่สามารถอัปเดตสถานะงานได้';
        this.toastService.error(errorMsg);
        this.setFeedback(errorMsg, true);
      }
    } catch {
      const errorMsg = 'ไม่สามารถอัปเดตสถานะงานได้ กรุณาลองใหม่อีกครั้ง';
      this.toastService.error(errorMsg);
      this.setFeedback(errorMsg, true);
    } finally {
      this.updatingTaskNo = '';
    }
  }

  taskStatusLabel(status: ETaskStatus): string {
    return {
      [ETaskStatus.WAITING]: 'รอมอบหมาย',
      [ETaskStatus.ASSIGNED]: 'พร้อมเริ่ม',
      [ETaskStatus.IN_PROGRESS]: 'กำลังดำเนินการ',
      [ETaskStatus.PAUSED]: 'ติดปัญหา',
      [ETaskStatus.QUALITY_CHECK]: 'รอตรวจ QC',
      [ETaskStatus.FINISHED]: 'เสร็จแล้ว',
      [ETaskStatus.CANCELLED]: 'ยกเลิก',
    }[status] ?? status;
  }

  taskStatusClass(status: ETaskStatus): string {
    return {
      [ETaskStatus.WAITING]: 'border-slate-200 bg-slate-100 text-slate-600',
      [ETaskStatus.ASSIGNED]: 'border-sky-200 bg-sky-50 text-sky-700',
      [ETaskStatus.IN_PROGRESS]: 'border-amber-200 bg-amber-50 text-amber-700',
      [ETaskStatus.PAUSED]: 'border-rose-200 bg-rose-50 text-rose-700',
      [ETaskStatus.QUALITY_CHECK]: 'border-violet-200 bg-violet-50 text-violet-700',
      [ETaskStatus.FINISHED]: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      [ETaskStatus.CANCELLED]: 'border-slate-200 bg-slate-100 text-slate-500',
    }[status] ?? 'border-slate-200 bg-slate-100 text-slate-600';
  }

  priorityClass(priority: ETaskPriority): string {
    return {
      [ETaskPriority.LOW]: 'bg-slate-100 text-slate-600',
      [ETaskPriority.NORMAL]: 'bg-sky-50 text-sky-700',
      [ETaskPriority.HIGH]: 'bg-amber-50 text-amber-700',
      [ETaskPriority.URGENT]: 'bg-rose-50 text-rose-700',
    }[priority] ?? 'bg-slate-100 text-slate-600';
  }

  priorityLabel(priority: ETaskPriority): string {
    return {
      [ETaskPriority.LOW]: 'ต่ำ',
      [ETaskPriority.NORMAL]: 'ปกติ',
      [ETaskPriority.HIGH]: 'สูง',
      [ETaskPriority.URGENT]: 'เร่งด่วน',
    }[priority] ?? priority;
  }

  vehicleLabel(task: IMyAssignment): string {
    const vehicle = task.workOrder?.vehicle;
    return [vehicle?.licensePlate, vehicle?.province].filter(Boolean).join(' ') || 'ไม่ระบุทะเบียน';
  }

  customerLabel(task: IMyAssignment): string {
    const vehicle = task.workOrder?.vehicle;
    return vehicle?.billingName || [vehicle?.firstname, vehicle?.lastname].filter(Boolean).join(' ') || 'ไม่ระบุลูกค้า';
  }

  dueLabel(task: IMyAssignment): string {
    if (!task.plannedFinishDate) return 'ยังไม่กำหนดวันเสร็จ';
    if (this.isOverdue(task)) return 'เลยกำหนดแล้ว';
    if (this.isDueToday(task)) return 'ครบกำหนดวันนี้';
    return 'กำหนดเสร็จ';
  }

  isOverdue(task: IMyAssignment): boolean {
    if (!task.plannedFinishDate || [ETaskStatus.FINISHED, ETaskStatus.CANCELLED].includes(task.status)) return false;
    return new Date(task.plannedFinishDate).getTime() < this.startOfToday().getTime();
  }

  isDueToday(task: IMyAssignment): boolean {
    if (!task.plannedFinishDate) return false;
    const due = new Date(task.plannedFinishDate);
    const start = this.startOfToday();
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return due >= start && due < end;
  }

  actionLabel(status: ETaskStatus): string | null {
    const labels: Partial<Record<ETaskStatus, string>> = {
      [ETaskStatus.ASSIGNED]: 'เริ่มงาน',
      [ETaskStatus.IN_PROGRESS]: 'ทำเสร็จแล้ว',
      [ETaskStatus.PAUSED]: 'ทำงานต่อ',
    };
    return labels[status] ?? null;
  }

  trackByTaskNo(_: number, task: IMyAssignment): string {
    return task.taskNo;
  }

  private async loadAssignments(): Promise<void> {
    const requestId = ++this.latestRequestId;
    this.isLoading = true;
    const query: IMyAssignmentQuery = {
      page: this.page,
      limit: this.limit,
      keyword: this.keyword.trim() || undefined,
      status: this.status || undefined,
      priority: this.priority || undefined,
      schedule: this.schedule,
    };
    try {
      const response = await this.taskService.getMyAssignments(query);
      if (requestId !== this.latestRequestId) return;
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.assignments = response.resultData;
        this.feedback = '';
      } else {
        this.setFeedback(response.developerMessage || 'ไม่สามารถโหลดงานที่ได้รับมอบหมายได้', true);
      }
    } catch {
      if (requestId === this.latestRequestId) {
        this.setFeedback('ไม่สามารถโหลดงานที่ได้รับมอบหมายได้ กรุณาลองใหม่อีกครั้ง', true);
      }
    } finally {
      if (requestId === this.latestRequestId) this.isLoading = false;
    }
  }

  private updateUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        keyword: this.keyword.trim() || null,
        status: this.status || null,
        priority: this.priority || null,
        schedule: this.schedule === 'ALL' ? null : this.schedule,
        page: this.page,
        limit: this.limit,
      },
    });
  }

  private nextStatus(status: ETaskStatus): ETaskStatus | null {
    const nextStatuses: Partial<Record<ETaskStatus, ETaskStatus>> = {
      [ETaskStatus.ASSIGNED]: ETaskStatus.IN_PROGRESS,
      [ETaskStatus.IN_PROGRESS]: ETaskStatus.FINISHED,
      [ETaskStatus.PAUSED]: ETaskStatus.IN_PROGRESS,
    };
    return nextStatuses[status] ?? null;
  }

  private actionSuccessMessage(status: ETaskStatus): string {
    return status === ETaskStatus.IN_PROGRESS ? 'เริ่มดำเนินการงานแล้ว' : 'บันทึกว่างานเสร็จแล้ว';
  }

  private isTaskStatus(value: unknown): value is ETaskStatus {
    return typeof value === 'string' && Object.values(ETaskStatus).includes(value as ETaskStatus);
  }

  private isTaskPriority(value: unknown): value is ETaskPriority {
    return typeof value === 'string' && Object.values(ETaskPriority).includes(value as ETaskPriority);
  }

  private isSchedule(value: unknown): value is TMyAssignmentSchedule {
    return ['ALL', 'OVERDUE', 'TODAY', 'UPCOMING', 'UNSCHEDULED'].includes(String(value));
  }

  private readPositiveNumber(value: unknown, fallback: number): number {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private setFeedback(message: string, isError: boolean): void {
    this.feedback = message;
    this.feedbackIsError = isError;
  }
}
