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
import {
  IProvince,
  PROVINCES,
} from '../../../shared/constant/province.constant';

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
  provinces: IProvince[] = PROVINCES;

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
        vin: ['', Validators.required],
        engine_no: [''],
        color: [''],
        mileage: ['', Validators.required],
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
        vin: data.vin ?? '',
        engine_no: data.engine_no ?? '',
        color: data.color ?? '',
        mileage: data.mileage ?? '',
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
        await this.vehicleManagementService.createCustomerVehicle(payload);

      if (res.resultCode === RESPONSE.CREATED || res.resultCode === RESPONSE.SUCCESS) {
        const opener = window.opener;
        const isWorkOrderPopup = window.name === 'create-customer-vehicle';
        if (isWorkOrderPopup && opener && !opener.closed) {
          opener.postMessage(
            {
              type: 'customer-vehicle-created',
              licensePlate: payload.licensePlate,
              province: payload.province,
            },
            window.location.origin,
          );

          // This child window is only for creating the vehicle. Keep the
          // original Work Order page untouched and close this window.
          window.close();
          return;
        }

        // Direct navigation cannot be closed safely by the browser.
        this.router.navigate(['/portal/vehicle']);
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

  getProvinceName(code: string): string {
    return this.provinces.find((p) => p.code === code)?.nameTH ?? code;
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
      vin: form.customerVehicle.vin,
      engine_no: form.customerVehicle.engine_no || undefined,
      color: form.customerVehicle.color || undefined,
      mileage: String(form.customerVehicle.mileage),

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
