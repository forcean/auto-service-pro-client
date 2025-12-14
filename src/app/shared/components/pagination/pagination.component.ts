import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { PaginationModel } from '../../interface/pagination.model';

@Component({
  selector: 'app-pagination',
  standalone: false,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() aligns = 'start';
  @Input() currentPage = 1;
  @Input() recordPerPage = 5;
  @Input() totalRecord = 0;
  @Input() maxPage = 5;
  @Input() reload = false;
  @Input() showAll = false;
  @Input() paginationOption: number[] = [];
  @Input() activeDropdown: string | null = null;
  @Output() changePage: EventEmitter<PaginationModel> = new EventEmitter<PaginationModel>();
  @Output() activeDropdownChange: EventEmitter<string | null> = new EventEmitter<string | null>();

  totalPages = 0;
  selectedItemsPerPage = 5;

  private perPage = 5;
  configListPerPage: number[] = [5, 10, 15, 20, 30, 40, 50];
  paginationResultsTable: PaginationModel = new PaginationModel();

  ngOnInit(): void {
    this.updateItemsPerPage();
    this.calculateTotalPages();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.paginationOption.length !== 0) {
      this.configListPerPage = this.paginationOption || [5, 10, 15, 20, 30, 40, 50];
    }

    if (changes['recordPerPage']) {
      this.selectedItemsPerPage = this.recordPerPage;
      this.perPage = this.recordPerPage;
      this.calculateTotalPages();
    }

    if (changes['totalRecord'] || changes['reload']) {
      this.calculateTotalPages();
    }

    if (changes['showAll']) {
      this.updateItemsPerPage();
    }
  }

  private updateItemsPerPage(): void {
    if (this.showAll) {
      this.selectedItemsPerPage = -1;
      this.perPage = this.totalRecord;
    } else {
      this.selectedItemsPerPage = this.recordPerPage;
      this.perPage = this.selectedItemsPerPage;
    }
  }

  onReset(): void {
    this.currentPage = 1;
    this.perPage = this.configListPerPage[0];
    this.selectedItemsPerPage = this.configListPerPage[0];
    this.paginationResultsTable = new PaginationModel(1, this.perPage);
    this.calculateTotalPages();
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalRecord / this.perPage);
  }

  isFirst(): boolean {
    return this.currentPage === 1;
  }

  isLast(): boolean {
    return this.currentPage === this.totalPages;
  }

  onEllipsisClick(direction: string): void {
    const { start, end } = this.calculateVisibleItems();
    if (direction === 'prev') {
      this.currentPage = start - 1;
    } else if (direction === 'next') {
      this.currentPage = end + 1;
    }
    this.emitPaginationData();
  }

  calculateVisibleItems(): { start: number, end: number } {
    const maxVisiblePages = 3;
    let start = Math.max(1, this.currentPage - 1);
    const end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return { start, end };
  }

  getVisiblePages(): number[] {
    if (this.totalPages <= 4) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    const { start, end } = this.calculateVisibleItems()
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  showLeftEllipsis(): boolean {
    return this.totalPages > this.maxPage && this.currentPage > Math.ceil(this.maxPage / 2);
  }

  showRightEllipsis(): boolean {
    return this.totalPages > this.maxPage && this.currentPage < this.totalPages - Math.floor(this.maxPage / 2);
  }

  onPaginate(page: number): void {
    this.currentPage = page;
    this.emitPaginationData();
  }

  onFirst(): void {
    this.currentPage = 1;
    this.emitPaginationData();
  }

  onLast(): void {
    this.currentPage = this.totalPages;
    this.emitPaginationData();
  }

  onNext(): void {
    if (!this.isLast()) {
      this.currentPage += 1;
      this.emitPaginationData();
    }
  }

  onPrevious(): void {
    if (!this.isFirst()) {
      this.currentPage -= 1;
      this.emitPaginationData();
    }
  }

  emitPaginationData(): void {
    this.paginationResultsTable = {
      page: this.currentPage,
      pageSize: this.perPage,
      recordsTotal: this.totalRecord,
    };
    this.changePage.emit(this.paginationResultsTable);
  }

  onClickChangePerPage(event: any): void {
    this.perPage = Number(event);

    this.calculateTotalPages();
    this.currentPage = 1;
    this.emitPaginationData();
  }

  toggleDropdown(dropdownName: string) {
    if (this.activeDropdown === dropdownName) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdownName;
    }
    this.activeDropdownChange.emit(this.activeDropdown);
  }

  isDropdownOpen(dropdownName: string): boolean {
    return this.activeDropdown === dropdownName;
  }

  handleDropdownClickOutside(dropdownName: string) {
    if (this.activeDropdown === dropdownName) {
      this.activeDropdown = null;
    }
  }
}
