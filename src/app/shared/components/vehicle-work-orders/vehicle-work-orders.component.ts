import { Component, EventEmitter, Input, Output } from '@angular/core';
export type WorkOrderStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IWorkOrder {
  id: string;
  workOrderNo: string;
  title: string;

  status: WorkOrderStatus;

  mechanic: string;

  createdAt?: string;
  updatedAt?: string;

  labor: number;
  parts: number;
  total: number;
  progress: number;
}
@Component({
  selector: 'app-vehicle-work-orders',
  standalone: false,
  templateUrl: './vehicle-work-orders.component.html',
  styleUrl: './vehicle-work-orders.component.scss',
})
export class VehicleWorkOrdersComponent {

  @Input()
  workOrders: IWorkOrder[] = [];

  @Output()
  create = new EventEmitter<void>();

  @Output()
  view = new EventEmitter<IWorkOrder>();

  @Output()
  print = new EventEmitter<IWorkOrder>();

  get totalOpen(): number {
    return this.workOrders.filter(x => x.status === 'OPEN').length;
  }

  get totalInProgress(): number {
    return this.workOrders.filter(
      x => x.status === 'IN_PROGRESS'
    ).length;
  }

  get totalCompleted(): number {
    return this.workOrders.filter(
      x => x.status === 'COMPLETED'
    ).length;
  }

  get totalCancelled(): number {
    return this.workOrders.filter(
      x => x.status === 'CANCELLED'
    ).length;
  }

  get totalRepairCost(): number {
    return this.workOrders.reduce(
      (sum, item) => sum + item.total,
      0
    );
  }

  getStatusLabel(status: WorkOrderStatus): string {

    switch (status) {

      case 'OPEN':
        return 'Open';

      case 'IN_PROGRESS':
        return 'In Progress';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      default:
        return status;

    }

  }

  getStatusClass(status: WorkOrderStatus): string {

    switch (status) {

      case 'OPEN':
        return 'bg-blue-100 text-blue-700';

      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-700';

      case 'COMPLETED':
        return 'bg-green-100 text-green-700';

      case 'CANCELLED':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  }

  onCreate(): void {
    this.create.emit();
  }

  onView(item: IWorkOrder): void {
    this.view.emit(item);
  }

  onPrint(item: IWorkOrder): void {
    this.print.emit(item);
  }

  trackById(index: number, item: IWorkOrder): string {
    return item.id;
  }

}