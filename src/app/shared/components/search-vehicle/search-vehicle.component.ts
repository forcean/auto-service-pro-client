import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISearchVehicle } from '../../interface/table-vehicle.interface';
import { PROVINCES } from '../../constant/province.constant';
import { IQueryCatalogVehicles } from '../../interface/catalog.interface';
import { CatalogService } from '../../services/catalog.service';
import { RESPONSE } from '../../enum/response.enum';
import { VEHICLE_STATUS_OPTIONS } from '../../constant/vehicle-status.constant';

@Component({
  selector: 'app-search-vehicle',
  standalone: false,
  templateUrl: './search-vehicle.component.html',
  styleUrl: './search-vehicle.component.scss',
})
export class SearchVehicleComponent implements OnInit {
  @Output() search = new EventEmitter<ISearchVehicle>();
  @Output() reset = new EventEmitter<void>();

  searchForm!: FormGroup;
  brands: any[] = [];
  model: any[] = [];
  isLoadingBrand = false;
  isLoadingVehicle = false;
  
  private readonly provinces = [...PROVINCES].sort(
    (a, b) => b.nameTH.length - a.nameTH.length,
  );

  readonly statusOptions = VEHICLE_STATUS_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private catalogService: CatalogService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadBrands();
  }

  private buildForm(): void {
    this.searchForm = this.fb.group({
      licensePlate: [''],
      brand: [''],
      model: [''],
      status: [''],
    });

    this.searchForm.get('brand')?.valueChanges.subscribe((value) => {
      this.searchForm.patchValue(
        {
          model: '',
        },
        {
          emitEvent: false,
        },
      );

      if (value) {
        this.loadModels(value);
      } else {
        this.model = [];
      }
    });
  }

  private parseLicensePlate(value: string): {
    licensePlate: string;
    province: string;
  } {
    value = value.trim();
    if (!value) {
      return {
        licensePlate: '',
        province: '',
      };
    }

    const province = this.provinces.find((item) => value.endsWith(item.nameTH));

    if (!province) {
      return {
        licensePlate: value,
        province: '',
      };
    }

    return {
      licensePlate: value
        .substring(0, value.length - province.nameTH.length)
        .trim(),
      province: province.code,
    };
  }

  onSubmit(): void {
    const formValue = this.searchForm.getRawValue();
    const result = this.parseLicensePlate(formValue.licensePlate);
    // console.log(this.searchForm.getRawValue());

    this.search.emit({
      ...formValue,
      licensePlate: result.licensePlate,
      province: result.province,
    });
  }

  onReset(): void {
    this.searchForm.reset({
      licensePlate: '',
      brand: '',
      model: '',
      status: '',
    });

    this.model = [];
    this.reset.emit();
  }

  async loadBrands() {
    this.isLoadingBrand = true;
    try {
      const params: IQueryCatalogVehicles = {
        isActive: true,
      };
      const response = await this.catalogService.getBrandsVehicles(params);
      if (response.resultCode == RESPONSE.SUCCESS) {
        this.brands = response.resultData.vehicleBrands || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      this.isLoadingBrand = false;
    }
  }

  private async loadModels(code: string) {
    this.isLoadingVehicle = true;

    try {
      const params: IQueryCatalogVehicles = {
        brandCode: code,
      };

      const response = await this.catalogService.getModelsVehicles(params);

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.model = response.resultData.vehicleModels ?? [];
      }
    } finally {
      this.isLoadingVehicle = false;
    }
  }
}
