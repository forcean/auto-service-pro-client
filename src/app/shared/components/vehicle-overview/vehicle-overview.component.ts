import { Component, Input } from '@angular/core';

export interface IStatCard {
  title: string;
  value: string;
  icon: string;
}

export interface IServiceHistory {
  id: string;
  date: string;
  mileage: number;
  service: string;
  mechanic: string;
}

export interface IVehicleDetail {
  id: string;
  registration: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  mileage: number;
  vin: string;
  status: 'ACTIVE' | 'INACTIVE';

  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

@Component({
  selector: 'app-vehicle-overview',
  standalone: false,
  templateUrl: './vehicle-overview.component.html',
  styleUrl: './vehicle-overview.component.scss'
})
export class VehicleOverviewComponent {

  @Input() vehicle!: IVehicleDetail;
  @Input() statCards: IStatCard[] = [];
  @Input() serviceHistory: IServiceHistory[] = [];

  formatNumber(value: number | null | undefined): string {
    return new Intl.NumberFormat('en-US').format(value ?? 0);
  }

  getHealthClass(status: 'good' | 'warning' | 'danger'): string {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-700';

      case 'warning':
        return 'bg-yellow-100 text-yellow-700';

      case 'danger':
        return 'bg-red-100 text-red-700';

      default:
        return '';
    }
  }

}
