import { Component, EventEmitter, Input, Output } from '@angular/core';
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;

export interface IWorkOrderCost {
  labor: number;
  parts: number;
  total: number;
}

export interface IWorkOrderItem {
  id: string | number;
  workOrderNo: string;
  title: string;
  status: WorkOrderStatus;
  statusText?: string;
  mechanicName?: string;
  createdAt: string;
  updatedAt?: string;
  progress: number;
  costs?: IWorkOrderCost;
}

export interface IWorkOrderSummary {
  totalOpen: number;
  totalInProgress: number;
  totalCompleted: number;
  totalRepairCost: number;
}
@Component({
  selector: 'app-vehicle-work-orders',
  standalone: false,
  templateUrl: './vehicle-work-orders.component.html',
  styleUrl: './vehicle-work-orders.component.scss',
})
export class VehicleWorkOrdersComponent {

 @Input() workOrders: IWorkOrderItem[] = [];
  @Input() summary?: IWorkOrderSummary;
  @Input() canViewFinancials: boolean = true;

  @Output() createWorkOrder = new EventEmitter<void>();
  @Output() viewDetail = new EventEmitter<string | number>();
  @Output() printWorkOrder = new EventEmitter<string | number>();

  // Helper สำหรับจัดรูปแบบตัวเลข ป้องกัน Null Pointer
  formatNumber(value?: number | null): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('th-TH').format(value);
  }

  // Helper กำหนด Dynamic Class สำหรับ Badge ตาม Status
  getStatusBadgeClass(status: WorkOrderStatus): string {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'IN_PROGRESS':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'COMPLETED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'CANCELLED':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-700';
    }
  }

  // Helper สลับ Icon ตาม Status
  getStatusIcon(status: WorkOrderStatus): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'folder-open';
      case 'IN_PROGRESS': return 'settings-2';
      case 'COMPLETED': return 'check-circle-2';
      case 'CANCELLED': return 'x-circle';
      default: return 'info';
    }
  }

  onCreateWorkOrder(): void {
    this.createWorkOrder.emit();
  }

  onViewDetail(id: string | number): void {
    this.viewDetail.emit(id);
  }

  onPrint(id: string | number): void {
    this.printWorkOrder.emit(id);
  }
}