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
import { ActivatedRoute, Router } from '@angular/router';

export type VehicleFormMode = 'create' | 'update';

@Component({
  selector: 'app-vehicle-form',
  standalone: false,
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  mode: VehicleFormMode = 'create';
  data: any | null = null;
  isLoading = false;
  private vehicleId: string | null = null;

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  statuses = VEHICLE_STATUS_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.mode = 'update';
      this.loadVehicle(this.vehicleId);
    } else {
      this.mode = 'create';
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

  private patchForm(data: any): void {
    this.form.patchValue({
      firstname: data.firstname ?? '',
      lastname: data.lastname ?? '',
      phoneNumber: data.phoneNumber ?? '',
      vehicle: {
        licensePlate: data.vehicle?.licensePlate ?? '',
        province: data.vehicle?.province ?? '',
        status: data.vehicle?.status ?? EVehicleStatus.PENDING,
      },
      vehicles: data.vehicles ?? [],
    });
  }

  private async loadVehicle(id: string): Promise<void> {
    this.isLoading = true;

    try {
      const data = {
        firstname: 'สมชาย',
        lastname: 'ใจดี',
        phoneNumber: '0812345678',
        vehicle: {
          licensePlate: '2กข1234',
          province: 'กรุงเทพมหานคร',
          status: EVehicleStatus.REPAIRING,
        },
        vehicles: [
          {
            id: 'camry-2021',
            brand: 'Toyota',
            model: 'Camry',
            generation: 'XV70',
            yearFrom: 2021,
            yearTo: 2024,
            engines: [
              {
                code: '2.5',
                fuel: 'Gasoline',
              },
            ],
            selectedEngines: [],
            remark: '',
          },
        ],
      };

      this.patchForm(data);
    } finally {
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }
    const payload = this.form.getRawValue();
    if (this.mode === 'create') {
      this.createVehicle(payload);
    } else {
      this.updateVehicle(payload);
    }
  }

  private createVehicle(payload: any): void {
    console.log('Create', payload);

    this.router.navigate(['/portal/vehicle']);
  }

  private updateVehicle(payload: any): void {
    console.log('Update', this.vehicleId, payload);

    this.router.navigate(['/portal/vehicle', this.vehicleId]);
  }

  onCancel(): void {
    if (this.vehicleId) {
      this.router.navigate(['/portal/vehicle', this.vehicleId]);
    } else {
      this.router.navigate(['/portal/vehicle']);
    }
  }

  get vehicleGroup(): FormGroup {
    return this.form.get('vehicle') as FormGroup;
  }

  get selectedVehicles(): IVehicle[] {
    return this.form.get('vehicles')?.value ?? [];
  }
}
