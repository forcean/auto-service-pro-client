import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
export const MOCK_PRODUCTS: any[] = [
  {
    _id: 'p001',
    sku: 'BRKP-BRM-GOLF-001',
    name: 'ผ้าเบรกหน้า Brembo Golf Mk7',
    brandName: 'Brembo',
    categoryName: 'Brake Pad',
    price: {
      retail: 1200,
      wholesale: 1000
    },
    image: 'https://picsum.photos/400/300?random=1',
    status: 'active',
    vehicles: [
      'VW Golf Mk7 1.4TSI',
      'VW Golf Mk7 1.8TSI'
    ]
  },

  {
    _id: 'p002',
    sku: 'OIL-BOS-GOLF-002',
    name: 'ไส้กรองน้ำมันเครื่อง Bosch',
    brandName: 'Bosch',
    categoryName: 'Oil Filter',
    price: {
      retail: 350
    },
    image: 'https://picsum.photos/400/300?random=2',
    status: 'active',
    vehicles: [
      'VW Golf Mk7 1.4TSI',
      'VW Passat B8 1.8TSI'
    ]
  },

  {
    _id: 'p003',
    sku: 'SUS-TRW-GOLF-003',
    name: 'โช้คอัพหน้า TRW',
    brandName: 'TRW',
    categoryName: 'Suspension',
    price: {
      retail: 4200,
      wholesale: 3800
    },
    image: 'https://picsum.photos/400/300?random=3',
    status: 'out_of_stock',
    vehicles: [
      'VW Golf Mk7'
    ]
  },

  {
    _id: 'p004',
    sku: 'ENG-MHL-GOLF-004',
    name: 'แท่นเครื่อง Mahle',
    brandName: 'Mahle',
    categoryName: 'Engine Mount',
    price: {
      retail: 2900
    },
    image: '',
    status: 'active',
    vehicles: [
      'VW Golf Mk7 1.4TSI'
    ]
  },

  {
    _id: 'p005',
    sku: 'BRKD-ATE-PASS-001',
    name: 'จานเบรกหน้า ATE',
    brandName: 'ATE',
    categoryName: 'Brake Disc',
    price: {
      retail: 3200,
      wholesale: 2800
    },
    image: 'https://picsum.photos/400/300?random=5',
    status: 'active',
    vehicles: [
      'VW Passat B8 2.0TDI'
    ]
  },

  {
    _id: 'p006',
    sku: 'FLT-MANN-GOLF-006',
    name: 'กรองอากาศ Mann Filter',
    brandName: 'MANN',
    categoryName: 'Air Filter',
    price: {
      retail: 480
    },
    image: 'https://picsum.photos/400/300?random=6',
    status: 'inactive',
    vehicles: [
      'VW Golf Mk7',
      'VW Tiguan Mk1'
    ]
  }
];

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  products = MOCK_PRODUCTS;
  filters: any = {};
  paginationOption: number[] = [10, 15, 20, 30, 40, 50];

  @Input() headers: any[] = [];
  @Input() config!: any;
  @Input() totalRecord: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 1;
  @Input() sort: string = '';
  @Input() isLoading: boolean = false;
  @Input() isDisableAction: boolean = false;

  constructor(
    private router: Router,
  ) { }

  goToDetail(productId: string) {
    console.log('go to product detail:', productId);
  }

  onFilterChange(filter: any) {
    this.filters = filter;
    this.loadProducts();
  }

  loadProducts() {
    // this.productService.getProducts(this.filters)
    //   .subscribe(res => {
    //     this.products = res.items;
    //     this.total = res.total;
    //   });
  }

  onPageChange(e: any) {
    // this.changePag.emit(e);
  }

  onClick(event: string) {
    this.router.navigate(['/portal/product/detail', event]);
  }
}
