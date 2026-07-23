import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { PaginationModel } from '../../interface/pagination.model';
import moment from 'moment';
import {
  IServiceHistoryResultData,
  ITableHeaderServiceHistory,
} from '../../interface/table-vehicle-service-history.interface';
import { VEHICLE_STATUS_OPTIONS } from '../../constant/vehicle-status.constant';
import { EVehicleStatus } from '../../enum/vehicle.enum';

@Component({
  selector: 'app-table-vehicle-service-history',
  standalone: false,
  templateUrl: './table-vehicle-service-history.component.html',
  styleUrl: './table-vehicle-service-history.component.scss',
})
export class TableVehicleServiceHistoryComponent implements OnInit, OnChanges {
  @Input() headers: ITableHeaderServiceHistory[] = [];
  @Input() config!: IServiceHistoryResultData;
  @Input() pageIndex = 1;
  @Input() pageSize = 20;
  @Input() sort = '';
  @Input() isLoading = false;
  @Input() isDeleteVehicle = false;

  @Output() sortEmit = new EventEmitter<string[]>();
  @Output() changePage = new EventEmitter<PaginationModel>();
  @Output() onView = new EventEmitter<string>();

  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  sorted: Record<string, boolean> = {};

  paginationOption = [10, 20, 30, 50, 100];

  ngOnInit(): void {
    console.log(
      'TableStockManagementComponent initialized with config:',
      this.config,
    );
  }

  ngOnChanges(): void {
    this.sorted = {};

    if (!this.sort) {
      return;
    }

    const [field, direction] = this.sort.split('.');
    this.sortField = field;
    this.sortDirection = direction as 'asc' | 'desc';
    this.sorted[field] = direction === 'asc';
  }

  onSort(field: string): void {
    const asc = !this.sorted[field];
    this.sorted = {
      [field]: asc,
    };
    this.sortField = field;
    this.sortDirection = asc ? 'asc' : 'desc';
    this.sortEmit.emit([`${field}.${this.sortDirection}`]);
  }

  onPageChange(event: PaginationModel): void {
    this.changePage.emit(event);
  }

  formatDate(date: string): string {
    return moment(date).format('DD/MM/YYYY HH:mm:ss');
  }

  trackBy(index: number, row: any): string {
    return row.id;
  }

  readonly statusMap = Object.fromEntries(
    VEHICLE_STATUS_OPTIONS.map((item) => [item.value, item]),
  ) as Record<
    EVehicleStatus,
    { value: EVehicleStatus; label: string; color: string }
  >;

  getStatus(status: EVehicleStatus) {
    return (
      this.statusMap[status] ?? {
        label: '-',
        color: '#6B7280',
      }
    );
  }
}
