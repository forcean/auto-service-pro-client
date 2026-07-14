import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-vehicle',
  standalone: false,
  templateUrl: './search-vehicle.component.html',
  styleUrl: './search-vehicle.component.scss',
})
export class SearchVehicleComponent implements OnInit {
  @Output() search = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  searchForm!: FormGroup;
  brands: any[] = [];
  vehicles: any[] = [];
  loadingBrand = false;
  loadingVehicle = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();

    this.loadBrands();
  }

  private buildForm(): void {
    this.searchForm = this.fb.group({
      keyword: [''],
      brand: [''],
      vehicle: [''],
      status: [''],
    });

    // เมื่อเปลี่ยน Brand ให้โหลด Model ใหม่
    this.searchForm.get('brand')?.valueChanges.subscribe((value) => {
      this.searchForm.patchValue(
        {
          vehicle: '',
        },
        {
          emitEvent: false,
        },
      );

      if (value) {
        this.loadVehicles(value);
      } else {
        this.vehicles = [];
      }
    });
  }

  onSubmit(): void {
    this.search.emit(this.searchForm.getRawValue());
  }

  onReset(): void {
    this.searchForm.reset({
      keyword: '',

      brand: '',

      vehicle: '',

      status: '',
    });

    this.vehicles = [];

    this.reset.emit();
  }

  /**
   * TODO : Call API
   */
  private loadBrands(): void {
    this.loadingBrand = true;

    // ตัวอย่างข้อมูล Mock
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

  /**
   * TODO : Call API
   */
  private loadVehicles(brandId: string): void {
    this.loadingVehicle = true;

    switch (brandId) {
      case 'toyota':
        this.vehicles = [
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
        this.vehicles = [
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
        this.vehicles = [];

        break;
    }

    this.loadingVehicle = false;
  }
}
