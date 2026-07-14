import { Component, EventEmitter, model, OnInit, Output } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';
import { RESPONSE } from '../../enum/response.enum';
import {
  IBrandVehicle,
  IModelVehicle,
  IQueryCatalogVehicles,
  IVehicle,
} from '../../interface/catalog.interface';

@Component({
  selector: 'app-vehicle-step-selector',
  standalone: false,
  templateUrl: './vehicle-step-selector.component.html',
  styleUrl: './vehicle-step-selector.component.scss',
})
export class VehicleStepSelectorComponent {
  @Output() selected = new EventEmitter<IVehicle>();

  brands: IBrandVehicle[] = [];
  models: IModelVehicle[] = [];
  vehicles: IVehicle[] = [];

  brandCode = '';
  modelCode = '';

  loadingModels = false;
  loadingVehicles = false;

  constructor(private catalogService: CatalogService) {
    this.loadBrands();
  }

  async loadBrands() {
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
    }
  }

  async selectBrand(code: any) {
    if (this.brandCode === code) {
      return;
    }

    this.brandCode = code;
    this.modelCode = '';
    this.models = [];
    this.vehicles = [];
    this.loadingModels = true;

    try {
      const params: IQueryCatalogVehicles = {
        brandCode: code,
      };

      const response = await this.catalogService.getModelsVehicles(params);

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.models = response.resultData.vehicleModels ?? [];
      }
    } finally {
      this.loadingModels = false;
    }
  }

  async selectModel(code: any) {
    if (this.modelCode === code) {
      return;
    }
    this.modelCode = code;
    this.vehicles = [];
    this.loadingVehicles = true;
    try {
      const generation = this.models.find(
        (x) => x.modelCode === code,
      )?.generation;

      const response = await this.catalogService.getVehicles({
        brandCode: this.brandCode,
        modelCode: code,
        generation,
      });

      if (response.resultCode === RESPONSE.SUCCESS) {
        this.vehicles = response.resultData.vehicles ?? [];
      }
    } finally {
      this.loadingVehicles = false;
    }
  }

  selectVehicle(v: any) {
    this.selected.emit({
      id: v.id,
      brand: v.brand,
      brandCode: v.brandCode,
      model: v.model,
      modelCode: v.modelCode,
      generation: v.generation,
      platform: v.platform,
      isActive: v.isActive,
      yearFrom: v.yearFrom,
      yearTo: v.yearTo,
      selectedEngines: [],
      engines: [...(v.engines ?? [])],
      isNew: true,
      remark: '',
    });
  }
}
