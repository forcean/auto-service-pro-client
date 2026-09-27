import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PaginationModel } from '../../interface/pagination.model';
import { IWorkOrder } from '../../interface/work-order.interface';

@Component({
  selector: 'app-table-team-assignment',
  standalone: false,
  templateUrl: './table-team-assignment.component.html',
  styleUrl: './table-team-assignment.component.scss',
})
export class TableTeamAssignmentComponent {
  @Input() data: IWorkOrder[] = [];
  @Input() pageIndex = 1;
  @Input() pageSize = 10;
  @Input() totalRecord = 0;
  @Input() isLoading = false;

  @Output() open = new EventEmitter<string>();
  @Output() changePage = new EventEmitter<PaginationModel>();

  readonly paginationOption = [10, 15, 20, 30, 50];

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      OPEN: 'เปิดใบงาน',
      INSPECTING: 'กำลังตรวจเช็ค',
      WAITING_QUOTATION: 'รอทำใบเสนอราคา',
      WAITING_APPROVAL: 'รอลูกค้าอนุมัติ',
      WAITING_ASSIGNMENT: 'รอมอบหมาย',
      IN_PROGRESS: 'กำลังซ่อม',
      WAITING_ADDITIONAL_APPROVAL: 'รออนุมัติงานเพิ่ม',
      WAITING_QC: 'รอตรวจ QC',
      REWORK: 'รอแก้ไขงาน',
      QC_APPROVED: 'QC ผ่าน',
      READY_DELIVERY: 'พร้อมส่งมอบ',
      COMPLETED: 'เสร็จสิ้น',
      CANCELLED: 'ยกเลิก',
      HOLD: 'พักงาน',
    };
    return labels[status] || status.replaceAll('_', ' ');
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      OPEN: 'status-neutral',
      INSPECTING: 'status-cyan',
      WAITING_QUOTATION: 'status-orange',
      WAITING_APPROVAL: 'status-amber',
      WAITING_ASSIGNMENT: 'status-blue',
      IN_PROGRESS: 'status-primary',
      WAITING_ADDITIONAL_APPROVAL: 'status-orange',
      WAITING_QC: 'status-violet',
      REWORK: 'status-rose',
      QC_APPROVED: 'status-teal',
      READY_DELIVERY: 'status-emerald',
      COMPLETED: 'status-neutral',
      CANCELLED: 'status-red',
      HOLD: 'status-gray',
    };
    return classes[status] || 'status-neutral';
  }

  vehicleName(item: IWorkOrder): string {
    const name = [item.vehicle?.firstname, item.vehicle?.lastname]
      .filter(Boolean)
      .join(' ');

    if (name) {
      return name;
    }

    if (item.vehicle?.billingName) {
      return item.vehicle.billingName;
    }

    return '-';
  }

  trackByWorkOrder(index: number, item: IWorkOrder): string {
    return item._id || item.workOrderNo || String(index);
  }

  onPageChange(event: PaginationModel): void {
    this.changePage.emit(event);
  }
}
