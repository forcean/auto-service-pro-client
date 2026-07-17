import { Component, EventEmitter, model, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EVehicleStatus, SERVICE_STATUS_LABEL } from '../../enum/vehicle.enum';
import { ISearchVehicle } from '../../interface/table-vehicle.interface';

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
  loadingBrand = false;
  loadingVehicle = false;
  
  readonly statusOptions = Object.values(EVehicleStatus).map((status) => ({
    value: status,
    label: SERVICE_STATUS_LABEL[status],
  }));

  constructor(private fb: FormBuilder) {}

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

    // เมื่อเปลี่ยน Brand ให้โหลด Model ใหม่
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
        this.loadVehicles(value);
      } else {
        this.model = [];
      }
    });
  }

  onSubmit(): void {
    console.log(this.searchForm.getRawValue());
    
    this.search.emit(this.searchForm.getRawValue());
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

  private loadBrands(): void {
    this.loadingBrand = true;

    this.brands = [
      {
        id: 'toyota',
        name: 'Toyota',
      },
      {
        id: 'honda',
        name: 'Honda',
      },
      {
        id: 'mazda',
        name: 'Mazda',
      },
      {
        id: 'ford',
        name: 'Ford',
      },
    ];

    this.loadingBrand = false;
  }

  private loadVehicles(brandId: string): void {
    this.loadingVehicle = true;

    switch (brandId) {
      case 'toyota':
        this.model = [
          {
            id: 'camry',
            name: 'Camry',
          },
          {
            id: 'corolla',
            name: 'Corolla Altis',
          },
          {
            id: 'hilux',
            name: 'Hilux Revo',
          },
        ];

        break;

      case 'honda':
        this.model = [
          {
            id: 'city',
            name: 'City',
          },
          {
            id: 'civic',
            name: 'Civic',
          },
          {
            id: 'crv',
            name: 'CR-V',
          },
        ];

        break;

      default:
        this.model = [];

        break;
    }

    this.loadingVehicle = false;
  }
}
