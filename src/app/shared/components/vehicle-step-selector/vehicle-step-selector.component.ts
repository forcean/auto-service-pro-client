import { Component, EventEmitter, model, OnInit, Output } from '@angular/core';
import { CatalogService } from '../../services/catalog.service';
import { RESPONSE } from '../../enum/response.enum';
import { IBrandVehicle, IModelVehicle, IQueryCatalogVehicles, IVehicle } from '../../interface/catalog.interface';

@Component({
  selector: 'app-vehicle-step-selector',
  standalone: false,
  templateUrl: './vehicle-step-selector.component.html',
  styleUrl: './vehicle-step-selector.component.scss'
})
export class VehicleStepSelectorComponent {
  @Output() selected = new EventEmitter<IVehicle>();

  step: 1 | 2 | 3 = 1;
  brands: IBrandVehicle[] = [];
  models: IModelVehicle[] = [];
  vehicles: IVehicle[] = [];

  brandCode!: string;
  modelCode!: string;

  constructor(
    private catalogService: CatalogService
  ) {
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
    this.brandCode = code;
    console.log('brandSelectedCode:', code);
    this.step = 2;
    try {
      const params: IQueryCatalogVehicles = {
        brandCode: this.brandCode,
      };
      const response = await this.catalogService.getModelsVehicles(params);
      if (response.resultCode == RESPONSE.SUCCESS) {
        this.models = response.resultData.vehicleModels || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async selectModel(code: any) {
    this.modelCode = code;
    console.log('modelSelectedCode:', code);
    this.step = 3;
    try {
      const params: IQueryCatalogVehicles = {
        brandCode: this.brandCode,
        modelCode: this.modelCode,
        generation: this.models.find(m => m.modelCode === this.modelCode)?.generation

      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode == RESPONSE.SUCCESS) {
        this.vehicles = response.resultData.vehicles || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
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
      remark: ''
    });

    this.reset();
  }

  reset() {
    this.step = 1;
    this.models = [];
    this.vehicles = [];
    this.brandCode = '';
    this.modelCode = '';
  }
}
