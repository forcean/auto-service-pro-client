import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IVehicle } from '../../interface/catalog.interface';

@Component({
  selector: 'app-vehicle-compatibility',
  standalone: false,
  templateUrl: './vehicle-compatibility.component.html',
  styleUrl: './vehicle-compatibility.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => VehicleCompatibilityComponent),
      multi: true,
    },
  ],
})
export class VehicleCompatibilityComponent
  implements ControlValueAccessor, OnInit
{
  @Input() mode: 'product' | 'customer' = 'product';
  @Input() allowRemark = true;
  @Input() allowEngineSelection = true;
  @Input() allowRemove = true;
  @Input() allowMultiple = true;
  @Input() headerText = "ความเข้ากันได้ของยานยนต์";

  vehicles: IVehicle[] = [];
  disabled = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    if (this.mode === 'customer') {
      this.allowEngineSelection = false;
      this.allowMultiple = false;
    }
  }

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

  addVehicle(vehicle: IVehicle): void {
    if (this.disabled) return;

    if (this.vehicles.some((v) => v._id === vehicle._id)) {
      return;
    }

    if (!this.allowMultiple) {
      this.vehicles = [
        {
          ...vehicle,
          selectedEngines: [],
        },
      ];
    } else {
      if (this.vehicles.some((v) => v._id === vehicle._id)) {
        return;
      }

      this.vehicles = [
        ...this.vehicles,
        {
          ...vehicle,
          selectedEngines: [],
        },
      ];
    }
    this.onChange(this.vehicles);
    this.onTouched();
  }

  remove(index: number): void {
    if (this.disabled) return;

    const newVehicles = [...this.vehicles];
    newVehicles.splice(index, 1);
    this.vehicles = newVehicles;

    this.onChange(this.vehicles);
    this.onTouched();
  }

  onRemarkChange(index: number, remark: string) {
    this.vehicles[index] = {
      ...this.vehicles[index],
      remark,
    };
    this.onChange(this.vehicles);
  }

  trackByVehicleId(index: number, item: IVehicle) {
    return item._id;
  }
}
