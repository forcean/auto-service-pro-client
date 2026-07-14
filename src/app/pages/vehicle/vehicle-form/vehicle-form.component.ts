import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { VEHICLE_STATUS_OPTIONS } from '../../../shared/constant/vehicle-status.constant';
import { IVehicle } from '../../../shared/interface/catalog.interface';
import { EVehicleStatus } from '../../../shared/enum/vehicle.enum';

export type VehicleFormMode = 'create' | 'update';

@Component({
  selector: 'app-vehicle-form',
  standalone: false,
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  @Input() mode: VehicleFormMode = 'create';
  @Input() data: any | null = null;
  @Input() isLoading = false;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  statuses = VEHICLE_STATUS_OPTIONS;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();

    if (this.mode === 'update' && this.data) {
      this.patchForm();
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
      vehicle: this.fb.group({
        licensePlate: ['', Validators.required],
        province: ['', Validators.required],
        status: [EVehicleStatus.PENDING, Validators.required],
      }),
      vehicles: new FormControl<IVehicle[]>([], {
        nonNullable: true,
        validators: Validators.required,
      }),
    });
  }

  patchForm(): void {
    this.form.patchValue({
      firstname: this.data.firstname ?? '',
      lastname: this.data.lastname ?? '',
      phoneNumber: this.data.phoneNumber ?? '',
      vehicle: {
        licensePlate: this.data.vehicle?.licensePlate ?? '',
        province: this.data.vehicle?.province ?? '',
        status: this.data.vehicle?.status ?? EVehicleStatus.PENDING,
      },

      vehicles: this.data.vehicles ?? [],
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }
    this.save.emit(this.form.getRawValue());
  }

  onCancel(): void {
    this.cancel.emit();
  }

  get vehicleGroup(): FormGroup {
    return this.form.get('vehicle') as FormGroup;
  }

  get selectedVehicles(): IVehicle[] {
    return this.form.get('vehicles')?.value ?? [];
  }
}
