import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { ROLE } from '../../../shared/enum/role.enum';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { IWorkOrder, IWorkOrderQuery } from '../../../shared/interface/work-order.interface';
import { PaginationModel } from '../../../shared/interface/pagination.model';
import { WorkOrderService } from '../../../shared/services/work-order.service';

@Component({
  selector: 'app-team-assignment',
  standalone: false,
  templateUrl: './team-assignment.component.html',
  styleUrl: './team-assignment.component.scss',
})
export class TeamAssignmentComponent implements OnInit {
  readonly statuses = EWorkOrderStatus;
  readonly paginationOption = [10, 15, 20, 30, 50];
  readonly teamAssignmentRoles = new Set<string>([ROLE.ADM, ROLE.MNG, ROLE.SO]);

  workOrder?: IWorkOrder;
  workOrders: IWorkOrder[] = [];
  page = 1;
  limit = 10;
  totalRecords = 0;
  searchQuery = '';
  selectedStatus: EWorkOrderStatus = EWorkOrderStatus.ALL;
  isLoading = true;
  errorMessage = '';
  currentRole = '';
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly workOrderService: WorkOrderService,
    private readonly handleTokenService: HandleTokenService,
  ) {
    this.currentRole = this.handleTokenService.getRole();
  }

  get canManageTeamAssignment(): boolean {
    return this.teamAssignmentRoles.has(this.currentRole);
  }

  ngOnInit(): void {
    const workOrderNo = this.route.snapshot.paramMap.get('id');
    if (workOrderNo) {
      void this.loadWorkOrder(workOrderNo);
      return;
    }

    void this.loadWorkOrders();
  }

  async loadWorkOrder(workOrderNo: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.workOrderService.getWorkOrderDetail(workOrderNo);
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถโหลดใบงานได้';
        return;
      }
      this.workOrder = response.resultData;
    } catch (error) {
      console.error('Failed to load team assignment workspace:', error);
      this.errorMessage = 'ไม่สามารถโหลดใบงานได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
  }

  async loadWorkOrders(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    const query: IWorkOrderQuery = {
      page: this.page,
      limit: this.limit,
      search: this.searchQuery.trim() || undefined,
    };

    if (this.selectedStatus !== EWorkOrderStatus.ALL) {
      query.status = this.selectedStatus;
    }

    try {
      const response = await this.workOrderService.getListWorkOrder(query);
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถโหลดรายการใบงานได้';
        return;
      }
      this.workOrders = response.resultData.data;
      this.totalRecords = response.resultData.total;
    } catch (error) {
      console.error('Failed to load work orders for team assignment:', error);
      this.errorMessage = 'ไม่สามารถโหลดรายการใบงานได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.page = 1;
      void this.loadWorkOrders();
    }, 400);
  }

  onStatusChange(): void {
    this.page = 1;
    void this.loadWorkOrders();
  }

  onPageChange(event: PaginationModel): void {
    this.page = event.page;
    this.limit = event.pageSize;
    void this.loadWorkOrders();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = EWorkOrderStatus.ALL;
    this.page = 1;
    void this.loadWorkOrders();
  }

  openWorkspace(workOrderNo: string): void {
    void this.router.navigate(['/portal/repair/team-assignment', workOrderNo]);
  }

  backToWorkOrders(): void {
    void this.router.navigate(['/portal/repair/work-orders']);
  }

  onFlowChanged(): void {
    if (this.workOrder?.workOrderNo) {
      void this.loadWorkOrder(this.workOrder.workOrderNo);
    }
  }

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

}
