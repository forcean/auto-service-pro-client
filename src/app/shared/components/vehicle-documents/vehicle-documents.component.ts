import { Component, EventEmitter, Input, Output } from '@angular/core';
export type DocumentCategory =
  | 'Invoice'
  | 'Receipt'
  | 'Warranty'
  | 'Insurance'
  | 'Quotation'
  | 'Other';

export interface IVehicleDocument {
  id: string;

  name: string;

  category: DocumentCategory;

  type: string; // pdf, jpg, png, docx, xlsx

  size: string;

  uploadedAt: string;

  url: string;
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

  get filteredDocuments(): IVehicleDocument[] {
    return this.documents.filter((doc) => {
      const matchSearch =
        !this.search ||
        doc.name.toLowerCase().includes(this.search.toLowerCase());

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

  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'fa-file-pdf';

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'fa-file-image';

      case 'doc':
      case 'docx':
        return 'fa-file-word';

      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';

      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';

      case 'zip':
      case 'rar':
        return 'fa-file-zipper';

      default:
        return 'fa-file';
    }
  }

  trackById(index: number, item: IVehicleDocument): string {
    return item.id;
  }
}
