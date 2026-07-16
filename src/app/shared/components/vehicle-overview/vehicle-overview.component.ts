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
@Input() vehicle: any;

  // ฟังก์ชันจัดฟอร์แมตตัวเลขสำหรับระบบภายใน
  formatNumber(value: number): string {
    if (!value) return '0';
    return new Intl.NumberFormat('th-TH').format(value);
  }

}
