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

  [EWorkOrderStatus.INSPECTING]: {
    label: 'กำลังตรวจเช็ค',
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

  [EWorkOrderStatus.WAITING_QUOTATION]: {
    label: 'รอจัดทำใบเสนอราคา',
    badge: 'bg-purple-500/10 text-purple-600 border-purple-200',
    border: 'border-t-purple-500',
    bar: 'bg-gradient-to-r from-purple-600 to-indigo-500',
  },

  [EWorkOrderStatus.WAITING_APPROVAL]: {
    label: 'รอลูกค้าอนุมัติ',
    badge: 'bg-orange-500/10 text-orange-600 border-orange-200',
    border: 'border-t-orange-500',
    bar: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },

  [EWorkOrderStatus.WAITING_ASSIGNMENT]: {
    label: 'รอมอบหมายงาน',
    badge: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    border: 'border-t-emerald-500',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },

  [EWorkOrderStatus.WAITING_ADDITIONAL_APPROVAL]: {
    label: 'รออนุมัติซ่อมเพิ่ม',
    badge: 'bg-amber-500/10 text-amber-700 border-amber-200',
    border: 'border-t-amber-500',
    bar: 'bg-gradient-to-r from-amber-500 to-orange-400',
  },
  [EWorkOrderStatus.WAITING_QC]: {
    label: 'รอตรวจ QC',
    badge: 'bg-violet-500/10 text-violet-700 border-violet-200',
    border: 'border-t-violet-500',
    bar: 'bg-gradient-to-r from-violet-500 to-indigo-400',
  },
  [EWorkOrderStatus.REWORK]: {
    label: 'ต้องแก้ไขงาน',
    badge: 'bg-rose-500/10 text-rose-700 border-rose-200',
    border: 'border-t-rose-500',
    bar: 'bg-gradient-to-r from-rose-500 to-orange-400',
  },
  [EWorkOrderStatus.QC_APPROVED]: {
    label: 'QC ผ่าน',
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    border: 'border-t-emerald-500',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },
  [EWorkOrderStatus.HOLD]: {
    label: 'พักงาน',
    badge: 'bg-slate-500/10 text-slate-700 border-slate-200',
    border: 'border-t-slate-400',
    bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
  },
  [EWorkOrderStatus.READY_DELIVERY]: {
    label: 'พร้อมส่งมอบ',
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
    border: 'border-t-emerald-500',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  },
  [EWorkOrderStatus.COMPLETED]: {
    label: 'ปิดงานแล้ว',
    badge: 'bg-slate-500/10 text-slate-600 border-slate-200',
    border: 'border-t-slate-400',
    bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
  },
  [EWorkOrderStatus.CANCELLED]: {
    label: 'ยกเลิก',
    badge: 'bg-rose-500/10 text-rose-700 border-rose-200',
    border: 'border-t-rose-500',
    bar: 'bg-gradient-to-r from-rose-500 to-rose-400',
  },
};
