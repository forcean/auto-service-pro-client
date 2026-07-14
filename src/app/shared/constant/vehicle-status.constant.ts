import { EVehicleStatus } from '../enum/vehicle.enum';

export const VEHICLE_STATUS_OPTIONS = [
  {
    value: EVehicleStatus.INSPECTING,
    label: 'กำลังตรวจสภาพ',
    color: '#3B82F6'
  },
  {
    value: EVehicleStatus.PENDING,
    label: 'รอดำเนินการ',
    color: '#94A3B8'
  },
  {
    value: EVehicleStatus.WAITING_PARTS,
    label: 'รออะไหล่',
    color: '#F59E0B'
  },
  {
    value: EVehicleStatus.REPAIRING,
    label: 'กำลังซ่อม',
    color: '#6366F1'
  },
  {
    value: EVehicleStatus.QUALITY_CHECK,
    label: 'ตรวจสอบคุณภาพ',
    color: '#06B6D4'
  },
  {
    value: EVehicleStatus.WAITING_APPROVAL,
    label: 'รออนุมัติ',
    color: '#F97316'
  },
  {
    value: EVehicleStatus.READY_FOR_PICKUP,
    label: 'พร้อมรับรถ',
    color: '#10B981'
  },
  {
    value: EVehicleStatus.COMPLETED,
    label: 'เสร็จสิ้น',
    color: '#22C55E'
  },
  {
    value: EVehicleStatus.CANCELLED,
    label: 'ยกเลิก',
    color: '#EF4444'
  }
];