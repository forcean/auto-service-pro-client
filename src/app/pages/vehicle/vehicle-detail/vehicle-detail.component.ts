import { Component, OnInit } from '@angular/core';
import {
  IQueryListHistory,
  IServiceHistoryResultData,
  ITableHeaderServiceHistory,
} from '../../../shared/interface/table-vehicle-service-history.interface';
import { IWorkOrder } from '../../../shared/components/vehicle-work-orders/vehicle-work-orders.component';
import { IVehicleDocument } from '../../../shared/components/vehicle-documents/vehicle-documents.component';
import { IImageGalleryItem } from '../../../shared/components/image-gallery/image-gallery.component';

interface IVehicleDetail {
  id: string;
  registration: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  mileage: number;
  vin: string;
  status: 'ACTIVE' | 'INACTIVE';

  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
}

interface IStatCard {
  title: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-vehicle-detail',
  standalone: false,
  templateUrl: './vehicle-detail.component.html',
  styleUrl: './vehicle-detail.component.scss',
})
export class VehicleDetailComponent implements OnInit {
  loading = false;
  activeTab: 'overview' | 'history' | 'work-orders' | 'documents' | 'photos' =
    'overview';

  vehicle!: IVehicleDetail;
  statCards: IStatCard[] = [];
  serviceHistory!: IServiceHistoryResultData;
  workOrders: IWorkOrder[] = [];
  documents: IVehicleDocument[] = [];
  photos: IImageGalleryItem[] = [];
  page = 1;
  limit = 20;
  sort = '';
  search!: IQueryListHistory;
  isLoading = false;
  isLoadingSummary = false;
  headers: ITableHeaderServiceHistory[] = [
    {
      headerName: 'id',
      valueType: 'string',
      isSort: true,
      i18nKey: 'หมายเลขงาน',
    },
    {
      headerName: 'mileage',
      valueType: 'string',
      isSort: true,
      i18nKey: 'ไมล์',
    },
    {
      headerName: 'service',
      valueType: 'string',
      isSort: false,
      i18nKey: 'service',
    },
    {
      headerName: 'date',
      valueType: 'string',
      isSort: true,
      i18nKey: 'วันที่',
    },
    {
      headerName: 'mechanic',
      valueType: 'string',
      isSort: true,
      i18nKey: 'mechanic',
    },
    {
      headerName: 'action',
      valueType: 'string',
      isSort: false,
      i18nKey: 'จัดการ',
    },
  ];

  ngOnInit(): void {
    this.loadVehicle();
    this.loadOverview();
    this.loadHistory();
    this.loadWorkOrders();
    this.loadDocuments();
    this.loadPhotos();
  }

  // ===========================
  // Load Data
  // ===========================

  loadVehicle(): void {
    this.vehicle = {
      id: '1',
      registration: '2กข1234',
      brand: 'Toyota',
      model: 'Camry',
      variant: '2.0G',
      year: 2021,
      color: 'White',
      mileage: 53500,
      vin: 'JTNB11HK5M3000123',
      status: 'ACTIVE',
      customer: {
        id: 'CUS000001',
        name: 'John Smith',
        phone: '0812345678',
        email: 'john@email.com',
      },
    };
  }

  loadOverview(): void {
    this.statCards = [
      {
        title: 'Mileage',
        value: `${this.formatNumber(this.vehicle.mileage)} km`,
        icon: 'fa-road',
      },
      {
        title: 'Last Service',
        value: '12 Jun 2026',
        icon: 'fa-screwdriver-wrench',
      },
      {
        title: 'Total Services',
        value: '15',
        icon: 'fa-clock-rotate-left',
      },
      {
        title: 'Open Work Orders',
        value: '2',
        icon: 'fa-file-circle-check',
      },
    ];
  }

  loadHistory(): void {
    this.serviceHistory = {
      page: 1,
      limit: 10,
      total: 5,
      totalPage: 1,
      history: [
        {
          id: '3274987239203803',
          date: '21/05/2026',
          mileage: '53,000 km',
          mechanic: 'mike',
          service: 'oil change',
        },
      ],
    };
  }

  loadWorkOrders(): void {
    this.workOrders = [
      {
        id: '2387498273942379847',
        workOrderNo: '65',
        title: 'example',
        status: 'IN_PROGRESS',
        mechanic: 'mike',
        labor: 77,
        parts: 546,
        total: 3,
        progress: 2,
      },
    ];
  }

  loadDocuments(): void {
    this.documents = [
      {
        id: 'DOC001',
        name: 'Invoice_WO240715001.pdf',
        category: 'Invoice',
        type: 'pdf',
        size: '1.8 MB',
        uploadedAt: '15 Jul 2026',
        url: '/assets/mock/documents/invoice-001.pdf',
      },
      {
        id: 'DOC002',
        name: 'Quotation_Brake_Service.pdf',
        category: 'Quotation',
        type: 'pdf',
        size: '950 KB',
        uploadedAt: '14 Jul 2026',
        url: '/assets/mock/documents/quotation-001.pdf',
      },
      {
        id: 'DOC003',
        name: 'Receipt_Repair_240701.pdf',
        category: 'Receipt',
        type: 'pdf',
        size: '780 KB',
        uploadedAt: '10 Jul 2026',
        url: '/assets/mock/documents/receipt-001.pdf',
      },
      {
        id: 'DOC004',
        name: 'Warranty_Battery.jpg',
        category: 'Warranty',
        type: 'jpg',
        size: '2.4 MB',
        uploadedAt: '08 Jul 2026',
        url: '/assets/mock/documents/warranty-battery.jpg',
      },
      {
        id: 'DOC005',
        name: 'Insurance_Policy.pdf',
        category: 'Insurance',
        type: 'pdf',
        size: '3.2 MB',
        uploadedAt: '01 Jul 2026',
        url: '/assets/mock/documents/insurance-policy.pdf',
      },
      {
        id: 'DOC006',
        name: 'Vehicle_Registration.pdf',
        category: 'Other',
        type: 'pdf',
        size: '1.1 MB',
        uploadedAt: '28 Jun 2026',
        url: '/assets/mock/documents/vehicle-registration.pdf',
      },
      {
        id: 'DOC007',
        name: 'Engine_Diagnosis_Report.docx',
        category: 'Other',
        type: 'docx',
        size: '540 KB',
        uploadedAt: '20 Jun 2026',
        url: '/assets/mock/documents/engine-report.docx',
      },
      {
        id: 'DOC008',
        name: 'Service_Checklist.xlsx',
        category: 'Other',
        type: 'xlsx',
        size: '320 KB',
        uploadedAt: '18 Jun 2026',
        url: '/assets/mock/documents/service-checklist.xlsx',
      },
    ];
  }

  loadPhotos(): void {
    this.photos = [
      {
        id: 'IMG001',
        url: 'https://picsum.photos/id/1071/1200/800',
        thumbnail: 'https://picsum.photos/id/1071/600/400',
        title: 'Front View',
        description: 'Vehicle front side',
        uploadedAt: '15 Jul 2026',
      },
      {
        id: 'IMG002',
        url: 'https://picsum.photos/id/1072/1200/800',
        thumbnail: 'https://picsum.photos/id/1072/600/400',
        title: 'Rear View',
        description: 'Vehicle rear side',
        uploadedAt: '15 Jul 2026',
      },
      {
        id: 'IMG003',
        url: 'https://picsum.photos/id/1073/1200/800',
        thumbnail: 'https://picsum.photos/id/1073/600/400',
        title: 'Engine Bay',
        description: 'Engine inspection',
        uploadedAt: '14 Jul 2026',
      },
      {
        id: 'IMG004',
        url: 'https://picsum.photos/id/1074/1200/800',
        thumbnail: 'https://picsum.photos/id/1074/600/400',
        title: 'Interior',
        description: 'Cabin condition',
        uploadedAt: '14 Jul 2026',
      },
      {
        id: 'IMG005',
        url: 'https://picsum.photos/id/1075/1200/800',
        thumbnail: 'https://picsum.photos/id/1075/600/400',
        title: 'Left Side',
        description: 'Body inspection',
        uploadedAt: '13 Jul 2026',
      },
      {
        id: 'IMG006',
        url: 'https://picsum.photos/id/1076/1200/800',
        thumbnail: 'https://picsum.photos/id/1076/600/400',
        title: 'Right Side',
        description: 'Body inspection',
        uploadedAt: '13 Jul 2026',
      },
    ];
  }

  changeTab(
    tab: 'overview' | 'history' | 'work-orders' | 'documents' | 'photos',
  ): void {
    this.activeTab = tab;
  }

  editVehicle(): void {
    console.log('Edit Vehicle');
  }

  deleteVehicle(): void {
    const confirmed = confirm('Are you sure you want to delete this vehicle?');

    if (!confirmed) return;

    console.log('Delete Vehicle');
  }

  back(): void {
    history.back();
  }

  // ===========================
  // Helpers
  // ===========================

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Active';

      case 'INACTIVE':
        return 'Inactive';

      default:
        return '-';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';

      case 'INACTIVE':
        return 'status-inactive';

      default:
        return '';
    }
  }

  getWorkOrderClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'badge-open';

      case 'IN_PROGRESS':
        return 'badge-progress';

      case 'COMPLETED':
        return 'badge-completed';

      default:
        return '';
    }
  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  onSort(sort: string[]): void {
    this.sort = sort.join(',');
    // this.updateUrlParams();
  }

  onChangePage(event: any): void {
    this.page = event.page;
    this.limit = event.pageSize;
    // this.updateUrlParams();
  }
}
