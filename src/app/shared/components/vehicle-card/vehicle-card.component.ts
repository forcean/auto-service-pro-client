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

  get enginesDisplay(): string {
    if (Array.isArray(this.vehicle.engines)) {
      return this.vehicle.engines.join(', ');
    }
    return this.vehicle.engines;
  }

  onRemove(): void {
    this.remove.emit();
  }

  onRemarkChange(value: string) {
    this.remarkChange.emit(value);
  }
}
