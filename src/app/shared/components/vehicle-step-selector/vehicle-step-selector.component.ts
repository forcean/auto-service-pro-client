import { Component, EventEmitter, model, Output } from '@angular/core';
import { VehicleCompatibility } from '../../interface/vehicle.interface';
import { CatalogService } from '../../services/catalog.service';
import { RESPONSE } from '../../enum/response.enum';
import { MOCK_VEHICLE_BRANDS, MOCK_VEHICLE_MODELS_1, MOCK_VEHICLE_MODELS_2, MOCK_VEHICLES } from '../../../pages/stock-management/products/product-create/mockData';

@Component({
  selector: 'app-vehicle-step-selector',
  standalone: false,
  templateUrl: './vehicle-step-selector.component.html',
  styleUrl: './vehicle-step-selector.component.scss'
})
export class VehicleStepSelectorComponent {
  @Output() selected = new EventEmitter<VehicleCompatibility>();

  step: 1 | 2 | 3 = 1;
  brands: any[] = [];
  models: any[] = [];
  vehicles: VehicleCompatibility[] = [];

  brandId!: string;
  modelId!: string;

  constructor(
    private catalogService: CatalogService
  ) {
    this.loadBrands();
  }

  async loadBrands() {
    try {
      const params = {
        isActive: true,
      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.brands = response.resultData;
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      this.brands = MOCK_VEHICLE_BRANDS;
    }
  }

  async selectBrand(id: any) {
    this.brandId = id;
    console.log('brandSelectedId:', id);
    this.step = 2;
    try {
      const params = {
        brandId: this.brandId,
      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.models = response.resultData;
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      if (this.brandId == '1') {
        this.models = MOCK_VEHICLE_MODELS_1;
      } else if (this.brandId == '2') {
        this.models = MOCK_VEHICLE_MODELS_2;
      }
    }
  }

  async selectModel(id: any) {
    this.modelId = id;
    console.log('modelSelectedId:', id);
    this.step = 3;
    try {
      const params = {
        modelId: this.modelId
      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.vehicles = response.resultData;
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      this.vehicles = MOCK_VEHICLES;
    }
  }

  selectVehicle(v: any) {
    this.selected.emit({
      vehicleId: v.vehicleId,
      brand: v.brand,
      model: v.model,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
      engines: v.engines,
      remark: ''
    });
    this.reset();
  }

  reset() {
    this.step = 1;
    this.models = [];
    this.vehicles = [];
    this.brandId = '';
    this.modelId = '';
  }
}
