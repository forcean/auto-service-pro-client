import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Activity,
  Wrench,
  ShieldAlert,
  Calendar,
  User,
  Fuel,
  Gauge,
  Search,
  Car,
} from 'lucide-angular';
import { ICustomerVehicle } from '../../interface/table-vehicle.interface';

export enum EFuelLevel {
  EMPTY = 'EMPTY',
  QUARTER = 'QUARTER',
  HALF = 'HALF',
  THREE_QUARTER = 'THREE_QUARTER',
  FULL = 'FULL',
}
@Component({
  selector: 'app-create-work-order-modal',
  standalone: false,
  templateUrl: './create-work-order-modal.component.html',
  styleUrl: './create-work-order-modal.component.scss',
})
export class CreateWorkOrderModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  // 1. เพิ่ม Input รับข้อมูลเดิมเพื่อรองรับโหมด Edit
  @Input() initialData: any = null;
  @Input() vehicles: ICustomerVehicle[] = [];
  @Input() isLoadingVehicles = false;
  @Input() vehicleIdToSelect: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();
  @Output() createVehicle = new EventEmitter<void>();

  createForm!: FormGroup;
  vehicleSearch = '';

  // Icons
  readonly IconX = X;
  readonly IconPlus = Plus;
  readonly IconTrash = Trash2;
  readonly IconFileText = FileText;
  readonly IconActivity = Activity;
  readonly IconWrench = Wrench;
  readonly IconShieldAlert = ShieldAlert;
  readonly IconCalendar = Calendar;
  readonly IconUser = User;
  readonly IconFuel = Fuel;
  readonly IconGauge = Gauge;
  readonly IconSearch = Search;
  readonly IconCar = Car;

  defaultInspectionItems = [
    { item: 'Engine Oil (น้ำมันเครื่อง)', status: 'WARNING', remark: '' },
    { item: 'Air Filter (กรองอากาศ)', status: 'BAD', remark: '' },
    { item: 'Brake Fluid (น้ำมันเบรก)', status: 'WARNING', remark: '' },
    { item: 'Tires (ยางรถยนต์)', status: 'WARNING', remark: '' },
    { item: 'Battery (แบตเตอรี่)', status: 'GOOD', remark: '' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  // 2. ดักจับเมื่อมีการส่ง initialData เข้ามาในโหมด Edit
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true) {
      this.vehicleSearch = '';
    }

    if (changes['vehicleIdToSelect']?.currentValue && this.createForm) {
      this.createForm.patchValue({
        vehicleId: changes['vehicleIdToSelect'].currentValue,
      });
    }

    if (changes['initialData'] && this.createForm) {
      if (this.initialData) {
        this.patchFormData(this.initialData);
      } else {
        this.resetToDefaultForm();
      }
    }
  }

  initForm(): void {
    this.createForm = this.fb.group({
      vehicleId: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      fuelLevel: [EFuelLevel.HALF],
      complaints: this.fb.array([]),
      inspectionRequired: [true],
      inspections: this.fb.array([]),
      diagnosis: [''],
      customerRemark: [''],
      internalRemark: [''],
      expectedFinishDate: [''],
      advisor: [''],
    });

    if (this.initialData) {
      this.patchFormData(this.initialData);
    } else {
      this.resetToDefaultForm();
    }
  }

  get complaintsArray(): FormArray {
    return this.createForm.get('complaints') as FormArray;
  }

  get inspectionsArray(): FormArray {
    return this.createForm.get('inspections') as FormArray;
  }

  get filteredVehicles(): ICustomerVehicle[] {
    const keyword = this.vehicleSearch.trim().toLowerCase();
    if (!keyword) return this.vehicles;

    return this.vehicles.filter((vehicle) =>
      [
        vehicle.licensePlate,
        vehicle.province,
        vehicle.firstname,
        vehicle.lastname,
        vehicle.phoneNumber,
        vehicle.vin,
        vehicle.vehicle?.brand,
        vehicle.vehicle?.model,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }

  get selectedVehicle(): ICustomerVehicle | undefined {
    const vehicleId = this.createForm?.get('vehicleId')?.value;
    return this.vehicles.find((vehicle) => vehicle._id === vehicleId);
  }

  formatVehicleLabel(vehicle: ICustomerVehicle): string {
    const owner = [vehicle.firstname, vehicle.lastname].filter(Boolean).join(' ');
    const model = [vehicle.vehicle?.brand, vehicle.vehicle?.model]
      .filter(Boolean)
      .join(' ');
    return [
      `${vehicle.licensePlate || '-'} ${vehicle.province || ''}`.trim(),
      owner,
      model,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  // 3. ฟังก์ชันเติมข้อมูลเก่าเข้าฟอร์ม (โหมดแก้ไข)
  private patchFormData(data: any): void {
    this.complaintsArray.clear();
    this.inspectionsArray.clear();

    this.createForm.patchValue({
      vehicleId: data.vehicleId || '',
      mileage: data.mileage || 0,
      fuelLevel: data.fuelLevel || EFuelLevel.HALF,
      inspectionRequired: data.inspectionRequired ?? true,
      diagnosis: data.diagnosis || '',
      customerRemark: data.customerRemark || '',
      internalRemark: data.internalRemark || '',
      expectedFinishDate: data.expectedFinishDate || '',
      advisor: data.advisorId || data.advisor || '',
    });

    if (data.complaints && data.complaints.length > 0) {
      data.complaints.forEach((c: any) => {
        this.complaintsArray.push(
          this.fb.group({
            title: [c.title || '', Validators.required],
            description: [c.description || ''],
          }),
        );
      });
    } else {
      this.addComplaint();
    }

    if (data.inspections && data.inspections.length > 0) {
      data.inspections.forEach((ins: any) => {
        this.inspectionsArray.push(
          this.fb.group({
            item: [ins.item || '', Validators.required],
            status: [ins.status || 'GOOD', Validators.required],
            remark: [ins.remark || ''],
          }),
        );
      });
    }
  }

  // รีเซ็ตกลับไปเป็นค่า Default สำหรับการสร้างใหม่ (Create Mode)
  private resetToDefaultForm(): void {
    this.createForm.reset({
      mileage: 0,
      fuelLevel: EFuelLevel.HALF,
      inspectionRequired: true,
    });
    this.complaintsArray.clear();
    this.inspectionsArray.clear();

    this.addComplaint();
    this.initDefaultInspections();
  }

  addComplaint(): void {
    this.complaintsArray.push(
      this.fb.group({
        title: ['', Validators.required],
        description: [''],
      }),
    );
  }

  removeComplaint(index: number): void {
    if (this.complaintsArray.length > 1) {
      this.complaintsArray.removeAt(index);
    }
  }

  initDefaultInspections(): void {
    this.defaultInspectionItems.forEach((def) => {
      this.inspectionsArray.push(
        this.fb.group({
          item: [def.item, Validators.required],
          status: [def.status, Validators.required],
          remark: [def.remark],
        }),
      );
    });
  }

  addCustomInspection(): void {
    this.inspectionsArray.push(
      this.fb.group({
        item: ['', Validators.required],
        status: ['GOOD', Validators.required],
        remark: [''],
      }),
    );
  }

  removeInspection(index: number): void {
    this.inspectionsArray.removeAt(index);
  }

  onClose(): void {
    this.close.emit();
  }

  onCreateVehicle(): void {
    this.createVehicle.emit();
  }

  clearVehicleSearch(): void {
    this.vehicleSearch = '';
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.createForm.value };

    if (!payload.inspectionRequired) {
      delete payload.inspections;
    }

    if (!payload.advisor) delete payload.advisor;
    if (!payload.expectedFinishDate) delete payload.expectedFinishDate;

    // ส่งข้อมูลออกไป (รองรับทั้ง Create และ Edit)
    this.submitForm.emit(payload);
  }
}
