import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { VehicleCompatibility } from '../../interface/vehicle.interface';

@Component({
  selector: 'app-vehicle-compatibility',
  standalone: false,
  templateUrl: './vehicle-compatibility.component.html',
  styleUrl: './vehicle-compatibility.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => VehicleCompatibilityComponent),
    multi: true
  }]
})
export class VehicleCompatibilityComponent implements ControlValueAccessor {
  vehicles: VehicleCompatibility[] = [];
  disabled = false;

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(value: any[]): void {
    this.vehicles = value ?? [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  addVehicle(vehicle: any): void {
    if (this.disabled) return;

    if (this.vehicles.some(v => v.vehicleId === vehicle.vehicleId)) {
      return;
    }

    this.vehicles = [...this.vehicles, vehicle];
    this.onChange(this.vehicles);
    this.onTouched();
  }

  remove(index: number): void {
    if (this.disabled) return;

    this.vehicles.splice(index, 1);
    this.onChange(this.vehicles);
    this.onTouched();
  }

  onRemarkChange(index: number, remark: string) {
    this.vehicles[index] = {
      ...this.vehicles[index],
      remark
    };
    this.onChange(this.vehicles);
  }


  trackByVehicleId(index: number, item: VehicleCompatibility) {
    return item.vehicleId;
  }
}