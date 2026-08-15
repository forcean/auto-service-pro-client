import { Component, EventEmitter, Input, Output } from '@angular/core';
export type DocumentCategory =
  | 'Invoice'
  | 'Receipt'
  | 'Warranty'
  | 'Insurance'
  | 'Quotation'
  | 'Other';

export interface IVehicleDocument {
  id: string | number;
  name: string;
  category: DocumentCategory;
  type: string; // pdf, jpg, png, docx, xlsx, zip
  size: string;
  uploadedAt: string;
  url: string;
  description?: string; // Optional: รายละเอียดเพิ่มเติม
  uploadedBy?: string; // Optional: ผู้ที่อัปโหลด
}

export interface IDocumentFilter {
  search: string;
  category: 'All' | DocumentCategory;
}
@Component({
  selector: 'app-vehicle-documents',
  standalone: false,
  templateUrl: './vehicle-documents.component.html',
  styleUrl: './vehicle-documents.component.scss',
})
export class VehicleDocumentsComponent {
  @Input() documents: IVehicleDocument[] = [];

  @Output() upload = new EventEmitter<void>();
  @Output() preview = new EventEmitter<IVehicleDocument>();
  @Output() download = new EventEmitter<IVehicleDocument>();
  @Output() delete = new EventEmitter<IVehicleDocument>();

  search = '';
  selectedCategory: 'All' | DocumentCategory = 'All';

  // หมวดหมู่สำหรับการวน Loop ปุ่ม Filter
  readonly categories: Array<'All' | DocumentCategory> = [
    'All',
    'Invoice',
    'Receipt',
    'Warranty',
    'Insurance',
    'Quotation',
    'Other',
  ];

  // Getter ประมวลผล ค้นหา และ คัดกรองหมวดหมู่
  get filteredDocuments(): IVehicleDocument[] {
    return (this.documents || []).filter((doc) => {
      const matchSearch =
        !this.search ||
        doc.name.toLowerCase().includes(this.search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(this.search.toLowerCase());

      const matchCategory =
        this.selectedCategory === 'All' ||
        doc.category === this.selectedCategory;

      return matchSearch && matchCategory;
    });
  }

  setCategory(category: 'All' | DocumentCategory): void {
    this.selectedCategory = category;
  }

  onUpload(): void {
    this.upload.emit();
  }

  onPreview(document: IVehicleDocument): void {
    this.preview.emit(document);
  }

  onDownload(document: IVehicleDocument): void {
    this.download.emit(document);
  }

  onDelete(document: IVehicleDocument): void {
    this.delete.emit(document);
  }

  // Lucide Icon Mapping ตามนามสกุลไฟล์
  getLucideIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'file-text';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'doc':
      case 'docx':
        return 'file-type-2';
      case 'xls':
      case 'xlsx':
        return 'sheet';
      case 'zip':
      case 'rar':
        return 'archive';
      default:
        return 'file';
    }
  }

  // สี Icon Dynamic ตามประเภทไฟล์
  getFileIconColorClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'xls':
      case 'xlsx':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'doc':
      case 'docx':
        return 'bg-sky-50 text-sky-600 border-sky-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200/60';
    }
  }

  // สี Badge Dynamic ตามประเภทเอกสาร
  getCategoryBadgeClass(category: DocumentCategory): string {
    switch (category) {
      case 'Invoice':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Receipt':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Warranty':
        return 'bg-purple-50 text-purple-700 border-purple-200/60';
      case 'Insurance':
        return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Quotation':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  trackById(_: number, item: IVehicleDocument): string | number {
    return item.id;
  }
}
