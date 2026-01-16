import { Component, EventEmitter, model, Output } from '@angular/core';
import { VehicleCompatibility } from '../../interface/vehicle.interface';

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
    // private vehicleService: VehicleService
  ) {
    this.loadBrands();
  }

  loadBrands() {
    this.brands = [
      { id: '1', name: 'Toyota' },
      { id: '2', name: 'Honda' },
      { id: '3', name: 'Ford' }
    ];
    // this.vehicleService.getBrands().subscribe(res => this.brands = res);
  }

  selectBrand(id: any) {
    this.brandId = id;
    console.log('brandSelectedId:', id);

    this.models = [
      { id: '1', name: 'Model A' },
      { id: '2', name: 'Model B' },
      { id: '3', name: 'Model C' }
    ];
    this.step = 2;
    // this.vehicleService.getModels(id).subscribe(res => this.models = res);
  }

  selectModel(id: any) {
    this.modelId = id;
    console.log('modelSelectedId:', id);
    this.vehicles = [
      { vehicleId: '1', model: 'Toyota Camry 2010-2015', brand: 'Toyota', yearFrom: 2010, yearTo: 2015, engines: ['1.6L', '2.0L'] },
      { vehicleId: '2', model: 'Toyota Camry 2016-2020', brand: 'Toyota', yearFrom: 2016, yearTo: 2020, engines: ['1.8L', '2.2L'] },
      { vehicleId: '3', model: 'Toyota Camry 2021-2024', brand: 'Toyota', yearFrom: 2021, yearTo: 2024, engines: ['2.0L Turbo'] }
    ];
    this.step = 3;
    // this.vehicleService.getVehicles(id).subscribe(res => this.vehicles = res);
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
    // this.models = [];
  }
}
