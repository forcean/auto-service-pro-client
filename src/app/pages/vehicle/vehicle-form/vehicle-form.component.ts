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
import { VehicleManagementService } from '../../../shared/services/vehicle-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { IVehicleKey } from '../../../shared/interface/table-vehicle.interface';

export type VehicleFormMode = 'create' | 'update';

@Component({
  selector: 'app-vehicle-form',
  standalone: false,
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  statuses = VEHICLE_STATUS_OPTIONS;
  mode: VehicleFormMode = 'create';
  data: any | null = null;
  isLoading = false;
  private vehicleKey!: IVehicleKey;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleManagementService: VehicleManagementService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    const licensePlate = this.route.snapshot.paramMap.get('licensePlate');
    const province = this.route.snapshot.paramMap.get('province');

    if (licensePlate && province) {
      this.vehicleKey = { licensePlate, province };
      this.mode = 'update';
      this.loadVehicle(this.vehicleKey.licensePlate, this.vehicleKey.province);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
      customerVehicle: this.fb.group({
        licensePlate: ['', Validators.required],
        province: ['', Validators.required],
        status: [EVehicleStatus.PENDING, Validators.required],
      }),
      catalogVehicle: new FormControl<IVehicle[]>([], {
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

      customerVehicle: {
        licensePlate: data.licensePlate ?? '',
        province: data.province ?? '',
        status: data.status ?? EVehicleStatus.PENDING,
      },

      catalogVehicle: [
        {
          ...data.vehicle,
          isNew: false,
          selectedEngines: data.vehicle?.engines ?? [],
          engines: data.vehicle?.engines ?? [],
        },
      ],
    });
  }

  private async loadVehicle(
    licensePlate: string,
    province: string,
  ): Promise<void> {
    this.isLoading = true;

    try {
      const res = await this.vehicleManagementService.getVehicleDetail(
        licensePlate,
        province,
      );

      if (res.resultCode == RESPONSE.SUCCESS) {
        this.patchForm(res.resultData);
      } else {
      }
    } catch (error) {
      // this.router.navigate(['/portal/vehicle']);
    } finally {
      this.isLoading = false;
    }
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.createVehicle();
    } else {
      this.updateVehicle();
    }
  }

  private async createVehicle() {
    try {
      const payload = this.buildPayload();

      const res =
        await this.vehicleManagementService.CreateCustomerVehicle(payload);

      if (res.resultCode == RESPONSE.CREATED) {
        console.log('created');
      } else {
      }
    } catch (error) {}

    // this.router.navigate(['/portal/vehicle']);
  }

  private async updateVehicle(): Promise<void> {
    if (!this.vehicleKey.licensePlate || !this.vehicleKey.province) {
      return;
    }

    // this.isLoading = true;

    try {
      const payload = this.buildPayload();
      console.log('Updating payload', payload);
      const res =
        await this.vehicleManagementService.updateCustomerVehicleDetail(
          payload,
          this.vehicleKey.licensePlate,
          this.vehicleKey.province,
        );

      if (res.resultCode === RESPONSE.SUCCESS) {
        console.log('updated');
        this.router.navigate([
          '/portal/vehicle',
          payload.licensePlate,
          payload.province,
        ]);
      }
    } catch (error) {
      console.error('Update vehicle error', error);
    } finally {
      // this.isLoading = false;
    }
  }

  onCancel(): void {
    if (this.mode === 'update' && this.vehicleKey) {
      this.router.navigate([
        '/portal/vehicle',
        this.vehicleKey.licensePlate,
        this.vehicleKey.province,
      ]);
    } else {
      this.router.navigate(['/portal/vehicle']);
    }
  }

  get vehicleGroup(): FormGroup {
    return this.form.get('customerVehicle') as FormGroup;
  }

  get selectedVehicles(): IVehicle[] {
    return this.form.get('catalogVehicle')?.value ?? [];
  }

  private buildPayload() {
    const form = this.form.getRawValue();
    const selectedVehicle = form.catalogVehicle?.[0];
    console.log('selectedVehicle', selectedVehicle);
    console.log('selectedEngines', selectedVehicle.selectedEngines);

    return {
      firstname: form.firstname,
      lastname: form.lastname,
      phoneNumber: form.phoneNumber,
      licensePlate: form.customerVehicle.licensePlate,
      province: form.customerVehicle.province,
      status: form.customerVehicle.status,

      vehicle: {
        brand: selectedVehicle.brand,
        brandCode: selectedVehicle.brandCode,
        model: selectedVehicle.model,
        modelCode: selectedVehicle.modelCode,
        generation: selectedVehicle.generation,
        platform: selectedVehicle.platform,
        yearFrom: selectedVehicle.yearFrom,
        yearTo: selectedVehicle.yearTo,

        engines: (selectedVehicle.selectedEngines?.length
          ? selectedVehicle.selectedEngines
          : selectedVehicle.engines
        ).map((engine: any) => ({
          code: engine.code,
          fuel: engine.fuel,
        })),

        remark: selectedVehicle.remark ?? '',
      },
    };
  }
}
