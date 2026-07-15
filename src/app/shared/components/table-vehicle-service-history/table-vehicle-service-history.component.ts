import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PaginationModel } from '../../interface/pagination.model';
import moment from 'moment';
import { IServiceHistoryResultData, ITableHeaderServiceHistory } from '../../interface/table-vehicle-service-history.interface';

@Component({
  selector: 'app-table-vehicle-service-history',
  standalone: false,
  templateUrl: './table-vehicle-service-history.component.html',
  styleUrl: './table-vehicle-service-history.component.scss'
})
export class TableVehicleServiceHistoryComponent implements OnInit, OnChanges {
  @Input() headers: ITableHeaderServiceHistory[] = [];
  @Input() config!: IServiceHistoryResultData;
  @Input() pageIndex = 1;
  @Input() pageSize = 20;
  @Input() sort = '';
  @Input() isLoading = false;

  @Output() sortEmit = new EventEmitter<string[]>();
  @Output() changePage = new EventEmitter<PaginationModel>();

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

  getMovementBadge(type: string): string {
    switch (type?.toLowerCase()) {
      case 'receive':
        return 'badge receive';

      case 'issue':
        return 'badge issue';

      case 'return':
        return 'badge return';

      case 'adjust':
        return 'badge adjust';

      case 'reserve':
        return 'badge reserve';

      case 'release':
        return 'badge release';

      default:
        return 'badge';
    }
  }

  getDirectionClass(direction: string): string {
    switch (direction) {
      case 'IN':
        return 'direction in';

      case 'OUT':
        return 'direction out';

      default:
        return 'direction adjust';
    }
  }

  quantityClass(row: any): string {
    switch (row.direction) {
      case 'IN':
        return 'qty-in';

      case 'OUT':
        return 'qty-out';

      case 'ADJUST':
        return row.afterQty >= row.beforeQty ? 'qty-in' : 'qty-out';

      default:
        return '';
    }
  }

  quantityText(row: any): string {
    switch (row.direction) {
      case 'IN':
        return `+${row.quantity}`;

      case 'OUT':
        return `-${row.quantity}`;

      case 'ADJUST':
        if (row.afterQty > row.beforeQty) {
          return `+${row.quantity}`;
        }

        if (row.afterQty < row.beforeQty) {
          return `-${row.quantity}`;
        }

        return `${row.quantity}`;

      default:
        return `${row.quantity}`;
    }
  }

  movementLabel(type: string): string {
    switch (type) {
      case 'receive':
        return 'รับเข้า';

      case 'issue':
        return 'เบิกออก';

      case 'return':
        return 'คืนสินค้า';

      case 'adjust':
        return 'ปรับสต็อก';

      case 'reserve':
        return 'สำรอง';

      case 'release':
        return 'ปลดสำรอง';

      default:
        return type;
    }
  }

  trackBy(index: number, row: any): string {
    return row.id;
  }
}

