import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
} from '@angular/forms';
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { CreateWorkOrderModalComponent } from '../../../shared/components/create-work-order-modal/create-work-order-modal.component';
import {
  LucideAngularModule,
  ClipboardList,
  Search,
  Plus,
  FileText,
  Clock,
  Wrench,
  ShieldCheck,
  Car,
  CheckCircle,
} from 'lucide-angular';
export enum EWorkOrderStatus {
  ALL = 'ALL',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  QUALITY_CHECK = 'QUALITY_CHECK',
  WAITING_PARTS = 'WAITING_PARTS',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
}

export interface WorkOrder {
  _id: string;
  workOrderNo: string;
  status: EWorkOrderStatus;
  progress: number;
  expectedFinishDate?: string;
  vehicle: {
    model: string;
    plateNumber: string;
    vin: string;
  };
  customer: {
    name: string;
    phone: string;
    isVip?: boolean;
  };
  tasks: Array<{
    title: string;
    completed: boolean;
  }>;
}
@Component({
  selector: 'app-work-order',
  standalone: false,
  templateUrl: './work-order.component.html',
  styleUrl: './work-order.component.scss',
})
export class WorkOrderComponent implements OnInit {
  @ViewChild(CreateWorkOrderModalComponent)
  createModal!: CreateWorkOrderModalComponent;
  private apiUrl = '/api/work-order'; // NestJS Base Endpoint

  workOrders: WorkOrder[] = [];
  filteredWorkOrders: WorkOrder[] = [];

  readonly ClipboardListIcon = ClipboardList;
  readonly SearchIcon = Search;
  readonly PlusIcon = Plus;
  readonly FileTextIcon = FileText;
  readonly ClockIcon = Clock;
  readonly WrenchIcon = Wrench;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly CarIcon = Car;
  readonly CheckCircleIcon = CheckCircle;

  // Filter States
  searchQuery: string = '';
  selectedStatus: string = 'ALL';
  selectedDate: string = '';

  // Modal State
  isCreateModalOpen: boolean = false;
  createForm!: FormGroup;

  // Status Styling Dictionary
  statusConfig: Record<
    string,
    { label: string; badge: string; border: string; bar: string }
  > = {
    PENDING: {
      label: 'PENDING',
      badge: 'bg-amber-500/10 text-amber-600 border-amber-200',
      border: 'border-t-amber-500',
      bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
    },
    IN_PROGRESS: {
      label: 'IN PROGRESS',
      badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
      border: 'border-t-blue-500',
      bar: 'bg-gradient-to-r from-blue-600 to-cyan-500',
    },
    QUALITY_CHECK: {
      label: 'QUALITY CHECK',
      badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
      border: 'border-t-purple-500',
      bar: 'bg-gradient-to-r from-purple-600 to-indigo-500',
    },
    WAITING_PARTS: {
      label: 'WAITING PARTS',
      badge: 'bg-orange-500/10 text-orange-600 border-orange-200',
      border: 'border-t-orange-500',
      bar: 'bg-gradient-to-r from-orange-500 to-amber-500',
    },
    READY_FOR_PICKUP: {
      label: 'READY FOR PICKUP',
      badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      border: 'border-t-emerald-500',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    },
    COMPLETED: {
      label: 'COMPLETED',
      badge: 'bg-slate-500/10 text-slate-600 border-slate-200',
      border: 'border-t-slate-400',
      bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
    },
  };

  statusCounts = {
    all: 0,
    pending: 0,
    inProgress: 0,
    qualityCheck: 0,
    readyForPickup: 0,
    completed: 0,
  };

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initCreateForm();
    this.fetchWorkOrders();
  }

  // สร้าง Reactive Form ตรงตาม CreateWorkOrderDto
  initCreateForm(): void {
    this.createForm = this.fb.group({
      vehicleId: ['', Validators.required],
      customerId: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      fuelLevel: ['HALF'],
      complaints: this.fb.array([
        this.fb.group({ title: ['', Validators.required], description: [''] }),
      ]),
      expectedFinishDate: [''],
      customerRemark: [''],
    });
  }

  get complaintsArray(): FormArray {
    return this.createForm.get('complaints') as FormArray;
  }

  addComplaint(): void {
    this.complaintsArray.push(
      this.fb.group({ title: ['', Validators.required], description: [''] }),
    );
  }

  removeComplaint(index: number): void {
    if (this.complaintsArray.length > 1) {
      this.complaintsArray.removeAt(index);
    }
  }

  // เรียก API POST /work-order
  submitCreateWorkOrder(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.http.post(this.apiUrl, this.createForm.value).subscribe({
      next: () => {
        this.closeCreateModal();
        this.fetchWorkOrders();
      },
      error: (err) => console.error('Error creating work order:', err),
    });
  }

  // เรียก API GET /work-order (Pagination/Search/Filter)
  fetchWorkOrders(): void {
    let params = new HttpParams();
    if (this.selectedStatus !== 'ALL') {
      params = params.set('status', this.selectedStatus);
    }
    if (this.searchQuery) {
      params = params.set('search', this.searchQuery);
    }

    this.http
      .get<{ data: WorkOrder[]; total: number }>(this.apiUrl, { params })
      .subscribe({
        next: (res) => {
          this.workOrders = res.data || [];
          this.calculateMetrics();
          this.applyLocalFilter();
        },
        error: (err) => console.error('Error fetching work orders:', err),
      });
  }

  calculateMetrics(): void {
    this.statusCounts = {
      all: this.workOrders.length,
      pending: this.workOrders.filter(
        (w) => w.status === EWorkOrderStatus.PENDING,
      ).length,
      inProgress: this.workOrders.filter(
        (w) => w.status === EWorkOrderStatus.IN_PROGRESS,
      ).length,
      qualityCheck: this.workOrders.filter(
        (w) => w.status === EWorkOrderStatus.QUALITY_CHECK,
      ).length,
      readyForPickup: this.workOrders.filter(
        (w) => w.status === EWorkOrderStatus.READY_FOR_PICKUP,
      ).length,
      completed: this.workOrders.filter(
        (w) => w.status === EWorkOrderStatus.COMPLETED,
      ).length,
    };
  }

  applyLocalFilter(): void {
    this.filteredWorkOrders = this.workOrders.filter((item) => {
      const matchSearch =
        !this.searchQuery ||
        item.workOrderNo
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        item.vehicle.plateNumber
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        item.customer.name
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());

      const matchStatus =
        this.selectedStatus === 'ALL' || item.status === this.selectedStatus;

      return matchSearch && matchStatus;
    });
  }

  // เรียก API PATCH /work-order/:id/status
  updateStatus(workOrderId: string, status: EWorkOrderStatus): void {
    this.http
      .patch(`${this.apiUrl}/${workOrderId}/status`, { status })
      .subscribe({
        next: () => this.fetchWorkOrders(),
        error: (err) => console.error('Error updating status:', err),
      });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  handleCreateWorkOrder(formData: any): void {
    console.log('created: ', formData);
  }

  handleViewDetail(order: WorkOrder): void {
    console.log('View detail:', order);
  }

  selectedOrderForPrint: WorkOrder | null = null;
  currentDate = new Date();

  handlePrintOrder(order: WorkOrder): void {
    this.selectedOrderForPrint = order;
    this.currentDate = new Date();

    // อัปเดต DOM
    this.cdr.detectChanges();

    // ดักจับ Event เมื่อผู้ใช้ปิดหน้าต่างพิมพ์ (ทั้งกด Print หรือ Cancel)
    const afterPrintHandler = () => {
      this.selectedOrderForPrint = null; // ล้างข้อมูลออก
      this.cdr.detectChanges();
      window.removeEventListener('afterprint', afterPrintHandler);
    };

    window.addEventListener('afterprint', afterPrintHandler);

    requestAnimationFrame(() => {
      window.print();
    });
  }

  handleNotifyCustomer(order: WorkOrder): void {
    console.log('Notify customer:', order);
  }
}
