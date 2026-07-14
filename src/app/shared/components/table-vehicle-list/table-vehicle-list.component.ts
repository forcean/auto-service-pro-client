import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { PaginationModel } from '../../interface/pagination.model';
import moment from 'moment';
import {
  ITableHeaderVehicle,
  IVehicleResultData,
} from '../../interface/table-vehicle.interface';

@Component({
  selector: 'app-table-vehicle-list',
  standalone: false,
  templateUrl: './table-vehicle-list.component.html',
  styleUrl: './table-vehicle-list.component.scss',
})
export class TableVehicleListComponent implements OnChanges {
  @Input() headers: ITableHeaderVehicle[] = [];
  @Input() config!: IVehicleResultData;
  @Input() totalRecord = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;
  @Input() sort: string = '';
  @Input() isLoading: boolean = false;
  @Input() isResetPassword: boolean = false;
  @Input() isViewUser: boolean = false;

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

  ngOnChanges(): void {
    this.sorted = {};
    this.sortList = [];

    if (!this.sort) return;

    const sorts = this.sort.split(',');
    sorts.forEach((s) => {
      const [field, dir] = s.split('.');
      this.sorted[field] = dir === 'asc';
    });

    this.sortField = sorts[0].split('.')[0];
    this.sortDirection = sorts[0].split('.')[1] as 'asc' | 'desc';
  }

  onSort(field: string) {
    if (!field) return;

    const isAsc = !this.sorted[field];
    this.sorted = { [field]: isAsc };

    this.sortDirection = isAsc ? 'asc' : 'desc';
    this.sortField = field;

    this.sortList = [`${field}.${this.sortDirection}`];

    this.sortEmit.emit(this.sortList);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'active':
        return 'badge-active';

      case 'service':
        return 'badge-service';

      case 'inactive':
        return 'badge-inactive';

      default:
        return 'badge-default';
    }
  }

  onPageChange(e: PaginationModel) {
    this.changePage.emit(e);
  }

  formatDate(date: string | null): string {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  }
}
