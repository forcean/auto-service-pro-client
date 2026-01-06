import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import moment from 'moment';
import { PaginationModel } from '../../interface/pagination.model';
import { ITableHeader, IUserResultData } from '../../interface/table-user-management.interface';


@Component({
  selector: 'app-table-user-management',
  standalone: false,
  templateUrl: './table-user-management.component.html',
  styleUrl: './table-user-management.component.scss'
})
export class TableUserManagementComponent implements OnChanges {

  @Input() headers: ITableHeader[] = [];
  @Input() config!: IUserResultData;
  @Input() totalRecord: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 1;
  @Input() sort: string = '';
  @Input() isLoading: boolean = false;
  @Input() isDisableAction: boolean = false;

  @Output() sortEmit = new EventEmitter<string[]>();
  @Output() changePage = new EventEmitter<PaginationModel>();
  @Output() onView = new EventEmitter<string>();
  @Output() onReset = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  sortList: string[] = [];
  sorted: { [key: string]: boolean } = {};
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  readonly ROLE_LABEL_MAP: Record<string, string> = {
    SO: 'System Owner',
    ADM: 'Admin',
    MNG: 'Manager',
    ACC: 'Accountant',
    SAL: 'Sale',
    STC: 'Stock Controller',
    MEC: 'Mechanic'
  };


  ngOnChanges(): void {
    this.sorted = {};
    this.sortList = [];

    if (!this.sort) return;

    const sorts = this.sort.split(',');
    sorts.forEach(s => {
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

  formatDate(date: string | null): string {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  }

  getStatusClass(status: boolean): string {
    return status ? 'badge-active' : 'badge-inactive';
  }

  onPageChange(e: PaginationModel) {
    this.changePage.emit(e);
  }

  mapRole(role: string | null | undefined): string {
    if (!role) {
      return '-';
    }
    return this.ROLE_LABEL_MAP[role] || role;
  }

}
