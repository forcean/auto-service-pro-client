import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
} from 'lucide-angular';

export enum EFuelLevel {
  EMPTY = 'EMPTY',
  QUARTER = 'QUARTER',
  HALF = 'HALF',
  THREE_QUARTER = 'THREE_QUARTER',
  FULL = 'FULL'

}@Component({
  selector: 'app-create-work-order-modal',
  standalone: false,
  templateUrl: './create-work-order-modal.component.html',
  styleUrl: './create-work-order-modal.component.scss',
})
export class CreateWorkOrderModalComponent implements OnInit {
  @Input() isOpen: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submitForm = new EventEmitter<any>();

  createForm!: FormGroup;

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

  initForm(): void {
    this.createForm = this.fb.group({
      vehicleId: ['', Validators.required],
      customerId: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      fuelLevel: ['HALF'],
      complaints: this.fb.array([
        this.fb.group({
          title: ['', Validators.required],
          description: [''],
        }),
      ]),
      inspectionRequired: [true],
      inspections: this.fb.array([]),
      diagnosis: [''],
      customerRemark: [''],
      internalRemark: [''],
      expectedFinishDate: [''],
      advisorId: [''],
    });

    this.initDefaultInspections();
  }

  get complaintsArray(): FormArray {
    return this.createForm.get('complaints') as FormArray;
  }

  get inspectionsArray(): FormArray {
    return this.createForm.get('inspections') as FormArray;
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

  onSubmit(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = { ...this.createForm.value };

    if (!payload.inspectionRequired) {
      delete payload.inspections;
    }

    if (!payload.advisorId) delete payload.advisorId;
    if (!payload.expectedFinishDate) delete payload.expectedFinishDate;

    this.submitForm.emit(payload);
    this.initForm();
  }
}