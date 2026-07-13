import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import moment from 'moment';

import { PaginationModel } from '../../interface/pagination.model';
import {
  IStockMovement,
  IStockMovementList,
} from '../../interface/stock-management.interface';
import { ITableHeader } from '../../interface/table-user-management.interface';
import { ITableHeaderStock } from '../../interface/table-stock-management.interface';

@Component({
  selector: 'app-table-stock-management',
  standalone: false,
  templateUrl: './table-stock-management.component.html',
  styleUrl: './table-stock-management.component.scss',
})
export class TableStockManagementComponent implements OnInit, OnChanges {
  @Input() headers: ITableHeaderStock[] = [];
  @Input() config!: IStockMovementList;
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
    return direction === 'IN' ? 'direction in' : 'direction out';
  }

  quantityClass(row: IStockMovement): string {
  switch (row.movementType) {
    case 'ISSUE':
    case 'RESERVE':
      return 'qty-out';

    case 'RECEIVE':
    case 'RETURN':
    case 'RELEASE':
      return 'qty-in';

    case 'ADJUST':
      return row.afterQty >= row.beforeQty
        ? 'qty-in'
        : 'qty-out';

    default:
      return '';
  }
}

  quantityText(row: IStockMovement): string {
  switch (row.movementType) {
    case 'ISSUE':
    case 'RESERVE':
      return `-${row.quantity}`;

    case 'RECEIVE':
    case 'RETURN':
    case 'RELEASE':
      return `+${row.quantity}`;

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

  trackBy(index: number, row: IStockMovement): string {
    return row.id;
  }
}
