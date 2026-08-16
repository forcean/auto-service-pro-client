import { EWorkOrderStatus } from '../enum/work-order.enum';

export interface IWorkOrderStatusConfig {
  label: string;
  badge: string;
  border: string;
  bar: string;
}

export const WORK_ORDER_STATUS_CONFIG: Record<
  Exclude<EWorkOrderStatus, EWorkOrderStatus.ALL>,
  IWorkOrderStatusConfig
> = {
  [EWorkOrderStatus.OPEN]: {
    label: 'เปิดใบสั่งงาน',
    badge: 'bg-sky-500/10 text-sky-600 border-sky-200',
    border: 'border-t-sky-500',
    bar: 'bg-gradient-to-r from-sky-500 to-cyan-400',
  },

  [EWorkOrderStatus.PENDING]: {
    label: 'รอดำเนินการ',
    badge: 'bg-amber-500/10 text-amber-600 border-amber-200',
    border: 'border-t-amber-500',
    bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
  },

  [EWorkOrderStatus.IN_PROGRESS]: {
    label: 'กำลังดำเนินการซ่อม',
    badge: 'bg-blue-500/10 text-blue-600 border-blue-200',
    border: 'border-t-blue-500',
    bar: 'bg-gradient-to-r from-blue-600 to-cyan-500',
  },

  [EWorkOrderStatus.QUALITY_CHECK]: {
    label: 'ตรวจสอบคุณภาพ',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
    border: 'border-t-purple-500',
    bar: 'bg-gradient-to-r from-purple-600 to-indigo-500',
  },

  [EWorkOrderStatus.WAITING_PARTS]: {
    label: 'รออะไหล่',
    badge: 'bg-orange-500/10 text-orange-600 border-orange-200',
    border: 'border-t-orange-500',
    bar: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },

  [EWorkOrderStatus.READY_FOR_PICKUP]: {
    label: 'รอส่งมอบ',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    border: 'border-t-emerald-500',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },

  [EWorkOrderStatus.COMPLETED]: {
    label: 'ซ่อมเสร็จสิ้น',
    badge: 'bg-slate-500/10 text-slate-600 border-slate-200',
    border: 'border-t-slate-400',
    bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
  },
};
