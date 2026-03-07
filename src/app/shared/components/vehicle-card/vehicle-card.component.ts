import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IVehicle } from '../../interface/catalog.interface';
@Component({
  selector: 'app-vehicle-card',
  standalone: false,
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss'
})
export class VehicleCardComponent {
  @Input() vehicle!: IVehicle;
  @Input() readonly = true;

  @Output() remove = new EventEmitter<void>();
  @Output() remarkChange = new EventEmitter<string>();

  onRemove(): void {
    this.remove.emit();
  }

  onRemarkChange(value: string) {
    this.remarkChange.emit(value);
  }

  // toggleEngine(engine: string, checked: boolean) {
  //   const set = new Set(this.vehicle.selectedEngines ?? []);

  //   checked ? set.add(engine) : set.delete(engine);

  //   this.vehicle.selectedEngines = Array.from(set);
  //   this.remarkChange.emit(this.vehicle.remark ?? '');
  // }

  toggleEngine(engineCode: string, checked: boolean) {
    const set = new Set(this.vehicle.selectedEngines ?? []);

    checked ? set.add(engineCode) : set.delete(engineCode);

    this.vehicle.selectedEngines = Array.from(set);
  }

  // get enginesDisplay(): string {
  //   if (Array.isArray(this.vehicle.engines)) {
  //     return this.vehicle.engines.join(', ');
  //   }
  //   return this.vehicle.engines || '';
  // }
  get enginesDisplay(): string {
    if (Array.isArray(this.vehicle?.engines)) {
      return this.vehicle.engines
        .map((e: any) => `${e.code} (${e.fuel})`)
        .join(', ');
    }
    return '';
  }

  get showEngineSelector(): boolean {
    return !!(
      this.vehicle.isNew &&
      Array.isArray(this.vehicle.engines) &&
      this.vehicle.engines.length > 1
    );
  }
}
