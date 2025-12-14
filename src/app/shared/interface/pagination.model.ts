export class PaginationModel {
  page: number;
  pageSize: number;
  recordsTotal: number;

  constructor(page?: number, pageSize?: number, recordsTotal?: number) {
    this.page = page || 1;
    this.pageSize = pageSize || 5;
    this.recordsTotal = recordsTotal || 0;
  }
}
