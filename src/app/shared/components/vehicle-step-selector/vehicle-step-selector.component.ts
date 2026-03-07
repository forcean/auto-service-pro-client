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

  brandId!: string;
  modelId!: string;

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
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.brands = response.resultData.brands || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async selectBrand(id: any) {
    this.brandId = id;
    console.log('brandSelectedId:', id);
    this.step = 2;
    try {
      const params: IQueryCatalogVehicles = {
        brandId: this.brandId,
      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.models = response.resultData.models || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  async selectModel(id: any) {
    this.modelId = id;
    console.log('modelSelectedId:', id);
    this.step = 3;
    try {
      const params: IQueryCatalogVehicles = {
        modelId: this.modelId
      };
      const response = await this.catalogService.getVehicles(params);
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.vehicles = response.resultData.vehicles || [];
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  }

  selectVehicle(v: any) {
    this.selected.emit({
      vehicleId: v.vehicleId,
      brand: v.brand,
      model: v.model,
      generation: v.generation,
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
    this.brandId = '';
    this.modelId = '';
  }
}
