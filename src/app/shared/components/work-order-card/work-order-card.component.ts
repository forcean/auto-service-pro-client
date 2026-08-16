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
} from 'lucide-angular';

export enum EWorkOrderStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  QUALITY_CHECK = 'QUALITY_CHECK',
  WAITING_PARTS = 'WAITING_PARTS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
}

export interface WorkOrder {
  _id: string;
  workOrderNo: string;
  status: EWorkOrderStatus;
  progress: number;
  expectedFinishDate?: string;
  vehicle: {
    model: string;
    plateNumber: string;
    vin: string;
  };
  customer: {
    name: string;
    phone: string;
    isVip?: boolean;
  };
  tasks: Array<{
    title: string;
    completed: boolean;
  }>;
}

@Component({
  selector: 'app-work-order-card',
  standalone: false,
  templateUrl: './work-order-card.component.html',
  styleUrl: './work-order-card.component.scss',
})
export class WorkOrderCardComponent {
  @Input({ required: true }) item!: WorkOrder;

  @Output() viewDetail = new EventEmitter<WorkOrder>();
  @Output() printOrder = new EventEmitter<WorkOrder>();
  @Output() notifyCustomer = new EventEmitter<WorkOrder>();

  // Lucide Icons
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

  // Configuration สีและ Style ตาม Status (ปรับ COMPLETED เป็นโทนสีเขียว)
  statusConfig: Record<
    string,
    { label: string; badge: string; border: string }
  > = {
    PENDING: {
      label: 'PENDING',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-200',
      border: 'border-t-amber-500',
    },
    IN_PROGRESS: {
      label: 'IN PROGRESS',
      badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
      border: 'border-t-blue-500',
    },
    QUALITY_CHECK: {
      label: 'QUALITY CHECK',
      badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
      border: 'border-t-purple-500',
    },
    WAITING_PARTS: {
      label: 'WAITING PARTS',
      badge: 'bg-orange-500/10 text-orange-600 border-orange-200',
      border: 'border-t-orange-500',
    },
    READY_FOR_PICKUP: {
      label: 'READY FOR PICKUP',
      badge: 'bg-teal-500/10 text-teal-600 border-teal-200',
      border: 'border-t-teal-500',
    },
    COMPLETED: {
      label: 'COMPLETED',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      border: 'border-t-emerald-500',
    },
  };

  /**
   * คำนวณการไล่โทนสี Progress จากแดง ไป เหลือง และไป เขียว (Red ➔ Yellow ➔ Emerald Green)
   */
  getProgressGradient(progress: number): string {
    if (progress <= 30) {
      return 'bg-gradient-to-r from-red-500 to-rose-400';
    } else if (progress <= 70) {
      return 'bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400';
    } else {
      return 'bg-gradient-to-r from-amber-500 via-emerald-500 to-green-500';
    }
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
}
