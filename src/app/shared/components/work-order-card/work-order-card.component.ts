import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Wrench,
  User,
  Crown,
  Phone,
  Calendar,
  Eye,
  Printer,
  Bell,
  Check,
  Circle,
  CheckCircle2,
} from 'lucide-angular';
import { WORK_ORDER_STATUS_CONFIG } from '../../constant/work-order-status.constant';
import { IWorkOrder, IComplaint } from '../../interface/work-order.interface';
import { EWorkOrderStatus } from '../../enum/work-order.enum';

@Component({
  selector: 'app-work-order-card',
  standalone: false,
  templateUrl: './work-order-card.component.html',
  styleUrl: './work-order-card.component.scss',
})
export class WorkOrderCardComponent {
  @Input({ required: true }) item!: IWorkOrder;

  @Output() viewDetail = new EventEmitter<IWorkOrder>();
  @Output() printOrder = new EventEmitter<IWorkOrder>();
  @Output() notifyCustomer = new EventEmitter<IWorkOrder>();

  readonly WrenchIcon = Wrench;
  readonly UserIcon = User;
  readonly CrownIcon = Crown;
  readonly PhoneIcon = Phone;
  readonly CalendarIcon = Calendar;
  readonly EyeIcon = Eye;
  readonly PrinterIcon = Printer;
  readonly BellIcon = Bell;
  readonly CheckIcon = Check;
  readonly CircleIcon = Circle;
  readonly CheckCircleIcon = CheckCircle2;

  readonly statusConfig = WORK_ORDER_STATUS_CONFIG;

  isComplaintCompleted(complaint: IComplaint | any): boolean {
    if (!complaint) return false;

    if (
      complaint.isCompleted ||
      complaint.completed ||
      complaint.status === 'FINISHED' ||
      complaint.status === 'COMPLETED' ||
      complaint.status === 'QC_APPROVED'
    ) {
      return true;
    }

    if (
      this.item.status === EWorkOrderStatus.COMPLETED ||
      this.item.status === EWorkOrderStatus.QC_APPROVED ||
      this.item.progress === 100
    ) {
      return true;
    }

    if (
      this.item.taskSummary &&
      this.item.taskSummary.totalTasks > 0 &&
      this.item.taskSummary.completedTasks >= this.item.taskSummary.totalTasks
    ) {
      return true;
    }

    return false;
  }

  getProgressGradient(progress: number): string {
    if (progress <= 30) {
      return 'bg-gradient-to-r from-red-500 to-rose-400';
    }

    if (progress <= 70) {
      return 'bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400';
    }

    return 'bg-gradient-to-r from-amber-500 via-emerald-500 to-green-500';
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.item);
  }

  onPrintOrder(): void {
    this.printOrder.emit(this.item);
  }

  onNotifyCustomer(): void {
    this.notifyCustomer.emit(this.item);
  }

  getStatusConfig() {
    if (this.item.status === EWorkOrderStatus.ALL) {
      return undefined;
    }

    return this.statusConfig[this.item.status];
  }
}
