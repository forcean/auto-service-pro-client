import { ICustomerVehicle } from './table-vehicle.interface';

export interface OverviewKpiSummary {
  totalVisits: number;
  totalSpend?: number; // ซ่อนได้ถ้าเป็น MEC / STC
  lastVisitDate?: string;
  openWorkOrdersCount: number;
}

// 6. Diagnostic Health Component Item
export type DiagnosticStatus =
  | 'OVERDUE'
  | 'REPLACE'
  | 'DUE_SOON'
  | 'FAIR'
  | 'GOOD';

export interface VehicleHealthItem {
  id: string;
  name: string; // เช่น "Engine Oil (น้ำมันเครื่อง)"
  status: DiagnosticStatus; // สถานะอะไหล่
  note?: string; // เช่น "Due in 1,000 KM" หรือ "สภาพ 60%"
  lastCheckedDate?: string;
}

export interface OverviewActiveWorkOrder {
  id: string;
  workOrderNo: string; // เช่น "#WO2400021"
  title: string; // เช่น "Brake Inspection" อาจไม่ใส่
  status: 'PENDING' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED';
  createdDate: string;
}

// 8. Recent Activity Widget Item
export interface OverviewActivityLog {
  id: string;
  date: string;
  description: string; // เช่น "เปลี่ยนน้ำมันเครื่อง"
  byUser?: string;
}

// 9. Recent Invoice Widget Data
export interface OverviewRecentInvoice {
  invoiceNo: string; // เช่น "#INV2400233"
  amount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

// 10. Service Plan Reminder Banner Data
export interface OverviewServicePlan {
  nextMileage: number; // เช่น 130000
  nextServiceDate?: string;
  remainingKm: number; // เช่น 4660
  description?: string;
}

export interface IVehicleOverviewState {
  kpi: OverviewKpiSummary;
  healthDiagnostics: VehicleHealthItem[];
  activeWorkOrder?: OverviewActiveWorkOrder | null;
  recentActivities: OverviewActivityLog[];
  recentInvoice?: OverviewRecentInvoice | null;
  servicePlan?: OverviewServicePlan | null;
  internalNote?: string; // บันทึกช่าง อาจเปลี่ยนเพราะมีหลาย []
}
