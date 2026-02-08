import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VehicleCompatibility } from '../../interface/vehicle.interface';

@Component({
  selector: 'app-vehicle-card',
  standalone: false,
  templateUrl: './vehicle-card.component.html',
  styleUrl: './vehicle-card.component.scss'
})
export class VehicleCardComponent {
  @Input() vehicle!: VehicleCompatibility;
  @Input() readonly = true;

  @Output() remove = new EventEmitter<void>();
  @Output() remarkChange = new EventEmitter<string>();

  onRemove(): void {
    this.remove.emit();
  }

  onRemarkChange(value: string) {
    this.remarkChange.emit(value);
  }

  toggleEngine(engine: string, checked: boolean) {
    const set = new Set(this.vehicle.selectedEngines ?? []);

    checked ? set.add(engine) : set.delete(engine);

    this.vehicle.selectedEngines = Array.from(set);
    this.remarkChange.emit(this.vehicle.remark ?? '');
  }

  get enginesDisplay(): string {
    if (Array.isArray(this.vehicle.engines)) {
      return this.vehicle.engines.join(', ');
    }
    return this.vehicle.engines || '';
  }

  get showEngineSelector(): boolean {
    return !!(
      this.vehicle.isNew &&
      Array.isArray(this.vehicle.engines) &&
      this.vehicle.engines.length > 1
    );
  }
}
