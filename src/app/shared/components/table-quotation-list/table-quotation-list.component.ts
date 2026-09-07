import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import moment from 'moment';
import { PaginationModel } from '../../interface/pagination.model';
import {
  EQuotationStatus,
  IQuotationListItem,
} from '../../interface/quotation.interface';
import {
  ITableHeaderQuotation,
  IQuotationResultData,
} from '../../interface/table-quotation.interface';

@Component({
  selector: 'app-table-quotation-list',
  standalone: false,
  templateUrl: './table-quotation-list.component.html',
  styleUrl: './table-quotation-list.component.scss',
})
export class TableQuotationListComponent implements OnChanges {
  @Input() headers: ITableHeaderQuotation[] = [];
  @Input() config!: IQuotationResultData;
  @Input() totalRecord = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;
  @Input() sort: string = '';
  @Input() isLoading: boolean = false;

  @Output() sortEmit = new EventEmitter<string[]>();
  @Output() changePage = new EventEmitter<PaginationModel>();
  @Output() onView = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  sortList: string[] = [];
  sorted: { [key: string]: boolean } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  statusMap: {
    [key in EQuotationStatus]: { label: string; color: string; bg: string };
  } = {
    [EQuotationStatus.DRAFT]: {
      label: 'ฉบับร่าง',
      color: '#475569',
      bg: '#f1f5f9',
    },
    [EQuotationStatus.PENDING_APPROVAL]: {
      label: 'รอนุมัติ',
      color: '#d97706',
      bg: '#fef3c7',
    },
    [EQuotationStatus.APPROVED]: {
      label: 'อนุมัติแล้ว',
      color: '#16a34a',
      bg: '#dcfce7',
    },
    [EQuotationStatus.REJECTED]: {
      label: 'ไม่อนุมัติ',
      color: '#dc2626',
      bg: '#fee2e2',
    },
    [EQuotationStatus.EXPIRED]: {
      label: 'หมดอายุ',
      color: '#9333ea',
      bg: '#f3e8ff',
    },
    [EQuotationStatus.CANCELLED]: {
      label: 'ยกเลิก',
      color: '#64748b',
      bg: '#e2e8f0',
    },
  };

  ngOnChanges(): void {
    this.sorted = {};
    this.sortList = [];

    if (!this.sort) return;

    const sorts = this.sort.split(',');
    sorts.forEach((s) => {
      const [field, dir] = s.split('.');
      this.sorted[field] = dir === 'asc';
    });

    if (sorts.length > 0) {
      const [field, dir] = sorts[0].split('.');
      this.sortField = field;
      this.sortDirection = (dir as 'asc' | 'desc') || 'asc';
    }
  }

  onSort(field: string): void {
    if (!field) return;

    const isAsc = !this.sorted[field];
    this.sorted = { [field]: isAsc };
    this.sortDirection = isAsc ? 'asc' : 'desc';
    this.sortField = field;
    this.sortList = [`${field}.${this.sortDirection}`];
    this.sortEmit.emit(this.sortList);
  }

  getStatusInfo(status: EQuotationStatus) {
    return (
      this.statusMap[status] || {
        label: status,
        color: '#64748b',
        bg: '#f1f5f9',
      }
    );
  }

  onPageChange(e: PaginationModel): void {
    this.changePage.emit(e);
  }

  formatDate(date: string | null | undefined): string {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  }
}
