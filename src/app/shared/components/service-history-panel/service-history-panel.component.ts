import { Component, Input, Output, EventEmitter } from '@angular/core';

// Interface ของข้อมูลรายละเอียดประวัติการซ่อม (ERP Structure)
export interface ServiceHistoryItem {
  name: string;
  sku?: string; // ถ้าเป็นอะไหล่
  category?: string; // ถ้าเป็นค่าแรง/บริการ
  quantity: number;
  price: number; // ราคาต่อหน่วย
}

export interface ServiceHistoryDetailData {
  invoiceNumber: string;
  workOrderId: string;
  serviceDate: string;
  mileage: number;
  mechanicName: string;
  items: ServiceHistoryItem[];
  subTotal: number;
  vatRate: number; // เช่น 7
  vatAmount: number;
  totalAmount: number;
  mechanicNotes?: string;
}
@Component({
  selector: 'app-service-history-panel',
  standalone: false,
  templateUrl: './service-history-panel.component.html',
  styleUrl: './service-history-panel.component.scss'
})
export class ServiceHistoryPanelComponent {
  // รับข้อมูลรายละเอียดประวัติการซ่อมจาก Parent (ตารางหลัก)
  @Input() data!: ServiceHistoryDetailData;
  
  // Event สำหรับแจ้ง Parent ให้ปิด Panel นี้
  @Output() closePanel = new EventEmitter<void>();

  // ฟังก์ชันสำหรับปิด Panel
  close() {
    this.closePanel.emit();
  }
}
