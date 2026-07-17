export enum EVehicleStatus {
  INSPECTING = 'INSPECTING',
  PENDING = 'PENDING',
  WAITING_PARTS = 'WAITING_PARTS',
  REPAIRING = 'REPAIRING',
  QUALITY_CHECK = 'QUALITY_CHECK',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const SERVICE_STATUS_LABEL: Record<string, string> = {
  INSPECTING: 'ตรวจเช็กสภาพ',
  PENDING: 'รอดำเนินการ',
  WAITING_PARTS: 'รออะไหล่',
  REPAIRING: 'กำลังซ่อม',
  QUALITY_CHECK: 'ตรวจสอบคุณภาพ',
  WAITING_APPROVAL: 'รอการอนุมัติ',
  READY_FOR_PICKUP: 'พร้อมส่งมอบ',
  COMPLETED: 'เสร็จสิ้น',
  CANCELLED: 'ยกเลิก',
};