import { Component, Input } from '@angular/core';
import { IVehicleOverviewState } from '../../interface/customer-vehicle-management.interface';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { ROLE } from '../../enum/role.enum';
@Component({
  selector: 'app-vehicle-overview',
  standalone: false,
  templateUrl: './vehicle-overview.component.html',
  styleUrl: './vehicle-overview.component.scss',
})
export class VehicleOverviewComponent {
  @Input() overviewData!: IVehicleOverviewState;
  currentRole: string = '';

  constructor(private handleTokenService: HandleTokenService) {
    this.currentRole = this.handleTokenService.getRole();
  }

  formatNumber(value?: number | null): string {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('th-TH').format(value);
  }

  hasRole(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.currentRole);
  }

  get canViewFinancials(): boolean {
    return this.hasRole([ROLE.SO, ROLE.ADM, ROLE.MNG, ROLE.ACC]);
  }

  get canViewInternalNoteExplicit(): boolean {
    return this.hasRole([
      ROLE.SO,
      ROLE.ADM,
      ROLE.MNG,
      ROLE.SAL,
      ROLE.STC,
      ROLE.MEC,
    ]);
  }
  // ฟังก์ชันสลับ Icon ตาม Diagnostic Status
  getHealthIcon(status: string): string {
    switch (status) {
      case 'OVERDUE':
        return 'alert-circle';
      case 'REPLACE':
        return 'alert-triangle';
      case 'DUE_SOON':
        return 'clock';
      case 'FAIR':
        return 'info';
      case 'GOOD':
        return 'check-circle-2';
      default:
        return 'info';
    }
  }
}
