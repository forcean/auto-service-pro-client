import { Component, model, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  product!: any;
  mainImageUrl = '';
  galleryImages: any[] = [];

  specEntries: { label: string; value: any }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    // mock
    this.product = {
      id: 'prd-001',

      name: 'ผ้าเบรกหน้า Toyota Camry',
      status: 'active',

      categoryId: 'cat-brake',
      categoryName: 'ผ้าเบรก',

      brandId: 'brand-toyota',
      brandName: 'Toyota',

      description:
        'ผ้าเบรกแท้เกรด OEM สำหรับ Toyota Camry ปี 2018–2022 ให้การเบรกนุ่ม เงียบ ทนความร้อนสูง',

      prices: [
        {
          type: 'RETAIL',
          amount: 1800
        },
        {
          type: 'WHOLESALE',
          amount: 1500
        },
        {
          type: 'COST',
          amount: 1200
        }
      ],

      spec: {
        unit: 'ชุด',
        weight: 2.3,
        width: 15,
        height: 10,
        depth: 8
      },

      vehicles: [
        {
          brand: 'Toyota',
          model: 'Camry',
          yearFrom: 2018,
          yearTo: 2020
        },
        {
          brand: 'Toyota',
          model: 'Camry',
          yearFrom: 2021,
          yearTo: 2022
        },
        {
          brand: 'Bmw',
          model: 'series3',
          yearFrom: 2019,
          yearTo: 2022
        }
      ],

      images: [
        {
          fileId: 'img-001',
          url: 'https://picsum.photos/800/600?random=1',
          isPrimary: true
        },
        {
          fileId: 'img-002',
          url: 'https://picsum.photos/800/600?random=2',
          isPrimary: false
        },
        {
          fileId: 'img-003',
          url: 'https://picsum.photos/800/600?random=3',
          isPrimary: false
        },
        {
          fileId: 'img-004',
          url: 'https://picsum.photos/800/600?random=4',
          isPrimary: false
        }
      ],

      createdAt: '2025-01-10T10:30:00Z',
      updatedAt: '2025-01-20T14:12:00Z'
    };


    const main = this.product.images.find((i: any) => i.isPrimary);
    this.mainImageUrl = main?.url;

    this.galleryImages = this.product.images.filter((i: any) => !i.isPrimary);

    this.specEntries = [
      { label: 'หน่วย', value: this.product.spec.unit },
      { label: 'น้ำหนัก', value: this.product.spec.weight },
      { label: 'กว้าง', value: this.product.spec.width },
      { label: 'สูง', value: this.product.spec.height },
      { label: 'ลึก', value: this.product.spec.depth }
    ].filter(s => s.value);
  }

  preview(url: string) {
    this.mainImageUrl = url;
  }

  goEdit() {
    this.router.navigate(['/portal/product/update', this.product.id]);
  }

  goBack() {
    // router back
  }
}
