import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Car,
  Gauge,
  Fuel,
  Wrench,
  Activity,
  FileText,
  ShieldAlert,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
} from 'lucide-angular';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { WorkOrderService } from '../../../shared/services/work-order.service';
import { IWorkOrder } from '../../../shared/interface/work-order.interface';
import { EWorkOrderStatus } from '../../../shared/enum/work-order.enum';
import { WORK_ORDER_STATUS_CONFIG } from '../../../shared/constant/work-order-status.constant';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';

@Component({
  selector: 'app-work-order-detail',
  standalone: false,
  templateUrl: './work-order-detail.component.html',
  styleUrl: './work-order-detail.component.scss',
})
export class WorkOrderDetailComponent implements OnInit {
  @ViewChild(ModalConditionComponent)
  modalConditionComponent!: ModalConditionComponent;

  // Lucide Icons
  readonly IconBack = ArrowLeft;
  readonly IconEdit = Edit;
  readonly IconTrash = Trash2;
  readonly IconCalendar = Calendar;
  readonly IconUser = User;
  readonly IconCar = Car;
  readonly IconGauge = Gauge;
  readonly IconFuel = Fuel;
  readonly IconWrench = Wrench;
  readonly IconActivity = Activity;
  readonly IconFileText = FileText;
  readonly IconShieldAlert = ShieldAlert;
  readonly IconCheck = CheckCircle;
  readonly IconClock = Clock;
  readonly WORK_ORDER_STATUS_CONFIG = WORK_ORDER_STATUS_CONFIG;

  workOrderId: string = '';
  isLoading: boolean = false;
  isDeleting: boolean = false;
  isEditModalOpen: boolean = false;
  isLoadingDelete: boolean = false;
  workOrder!: IWorkOrder;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loadingBarService: LoadingBarService,
    private modalCommonService: ModalCommonService,
    private readonly workOrderService: WorkOrderService,
    private modalConditionService: ModalConditionService,
  ) {}

  ngOnInit(): void {
    this.initializePermissions();
  }

  private async initializePermissions() {
    try {
      // this.permissions = await this.permissionService.permissions();
      // this.isViewUserList = this.permissionService.isViewUserList;
      // this.isResetPassword = this.permissionService.isResetPassword;
      // if (!this.isViewUserList) {
      //   this.router.navigate(['/not-found']);
      // } else {
      // this.route.queryParams.subscribe((params) => {
      //   this.loadWorkOrder(this.workOrderId);
      // });
      this.workOrderId =
        this.route.snapshot.paramMap.get('id') || 'WO-2026-0816';
      this.loadWorkOrder(this.workOrderId);
      // }
    } catch (error) {
      // const errorObject = error as { message: string };
      // if (errorObject.message !== '504') {
      //   this.handleCommonError();
      // }
    }
  }

  async loadWorkOrder(orderNo: string) {
    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const response = await this.workOrderService.getWorkOrderDetail(orderNo);

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.workOrder = response.resultData;
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      this.isLoading = false;
      loader.complete();
    }
  }

  async deleteUser(id: string) {
    this.isLoadingDelete = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      this.modalConditionComponent.onClose();
      const res = await this.workOrderService.deleteWorkOrder(id);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleSuccessDelete();
        this.router.navigate(['/portal/corporate-admin/account']);
      } else {
        this.handleFailDelete();
      }
    } catch (error) {
      console.error('Response error', error);
      // this.handleCommonError();
    } finally {
      this.isLoadingDelete = false;
      loader.complete();
    }
  }

  onBack(): void {
    this.router.navigate(['/portal/repair/work-orders']);
  }

  onEdit(): void {
    this.isEditModalOpen = true;
  }

  onDelete() {
    this.handleModalDelete();
  }

  handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.deleteUser(this.workOrderId);
    }
  }

  async onSaveEdit(editData: any) {
    try {
      const response = await this.workOrderService.updateWorkOrder(
        editData,
        this.workOrderId,
      );

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.isEditModalOpen = false;
        this.handleCommonSuccess();
        this.loadWorkOrder(this.workOrderId);
      }
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  }

  getStatusConfig() {
    if (this.workOrder.status === EWorkOrderStatus.ALL) {
      return null;
    }

    return WORK_ORDER_STATUS_CONFIG[this.workOrder.status];
  }

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle:
        'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });
  }

  private handleCommonSuccess() {
    this.modalCommonService.open({
      type: 'success',
      title: 'แก้ไขใบแจ้งซ่อมสำเร็จ',
      subtitle: 'คุณได้แก้ไขใบแจ้งซ่อมของลูกค้าเรียบร้อยแล้ว',
      buttonText: 'ยืนยัน',
    });
  }

  private handleModalDelete() {
    this.modalConditionService.open({
      type: 'change',
      title: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
      subtitle:
        'หากคุณยืนยัน ระบบจะทำการลบผู้ใช้นี้ออกจากระบบ และไม่สามารถกู้คืนได้ คลิก "ยืนยัน" เพื่อดำเนินการต่อ หรือคลิก "ยกเลิก" เพื่อออกจากหน้าต่างนี้.',
    });
  }

  private handleFailDelete() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ไม่สามารถลบผู้ใช้ได้',
      subtitle:
        'ไม่สามารถลบผู้ใช้ได้ โปรดลองอีกครั้งหรือติดต่อ<br>ผู้ดูแลระบบหากปัญหายังคงอยู่',
      buttonText: 'ยืนยัน',
    });
  }

  private handleSuccessDelete() {
    this.modalCommonService.open({
      type: 'success',
      title: 'ลบผู้ใช้สำเร็จ',
      subtitle: 'ผู้ใช้นี้ถูกลบออกจากระบบเรียบร้อยแล้ว.',
      buttonText: 'เข้าใจแล้ว',
    });
  }
}
