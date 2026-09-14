import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RESPONSE } from '../../../shared/enum/response.enum';
import { IWorkOrder } from '../../../shared/interface/work-order.interface';
import { WorkOrderService } from '../../../shared/services/work-order.service';

@Component({
  selector: 'app-team-assignment',
  standalone: false,
  templateUrl: './team-assignment.component.html',
  styleUrl: './team-assignment.component.scss',
})
export class TeamAssignmentComponent implements OnInit {
  workOrder?: IWorkOrder;
  workOrders: IWorkOrder[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly workOrderService: WorkOrderService,
  ) {}

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

    try {
      const response = await this.workOrderService.getListWorkOrder({ page: 1, limit: 50 });
      if (response.resultCode !== RESPONSE.SUCCESS) {
        this.errorMessage = response.developerMessage || 'ไม่สามารถโหลดรายการใบงานได้';
        return;
      }
      this.workOrders = response.resultData.data;
    } catch (error) {
      console.error('Failed to load work orders for team assignment:', error);
      this.errorMessage = 'ไม่สามารถโหลดรายการใบงานได้ โปรดลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
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
}
