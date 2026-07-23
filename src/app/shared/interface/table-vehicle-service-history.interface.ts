import { EVehicleStatus } from "../enum/vehicle.enum";

export interface IServiceHistoryResultData {
  keyword?: string;
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  history: IHistoryList[];
}
export interface IHistoryList {
  id: string; // ID ของรายการประวัติ
  workOrderNo: string; // หมายเลขงาน (เช่น "WO-202607-001") [เพิ่ม]
  workOrderId?: string; // ID สำหรับกดลิงก์ไปหน้า Work Order Detail [เพิ่ม]
  date: string; // ISO Date String (เช่น "2026-07-23T08:30:00Z")
  mileage: number; // เปลี่ยนเป็น number เพื่อใช้ Sort เลขกิโลเมตรได้ง่าย
  service: string; // หัวข้อบริการหลัก (เช่น "ถ่ายน้ำมันเครื่อง + เช็คระยะ")
  mechanic: string; // ช่างผู้รับผิดชอบ
  status: EVehicleStatus; // สถานะของงาน (เช่น "COMPLETED") [เพิ่ม]
  totalAmount?: number; // ยอดรวมค่าบริการ [เพิ่ม]
  branchName?: string; // สาขา/ศูนย์บริการ (ถ้ามี) [เพิ่ม]
}

export interface ITableHeaderServiceHistory {
  headerName: string;
  valueType: string;
  i18nKey?: string;
  isSort?: boolean;
}

export interface IQueryListHistory extends ISearchCriteria {
  page: number;
  limit: number;
  sort?: string;
}

export interface ISearchCriteria {
  licensePlate?: string;
}
