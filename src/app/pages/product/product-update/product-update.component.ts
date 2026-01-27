import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ICategory } from '../../../shared/interface/category.interface';
import { ProductBrand } from '../../../shared/interface/brand.interface';
import { CatalogService } from '../../../shared/services/catalog.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { IQueryCatalogProducts } from '../../../shared/interface/catalog.interface';
import { IUploadImagePayload } from '../../../shared/interface/file-management.interface';
import { IReqCreateProduct, IReqUpdateProduct } from '../../../shared/interface/stock-management.interface';
import { FileManagementService } from '../../../shared/services/file-management.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { StockManagementService } from '../../../shared/services/stock-management.service';
import { BRAND_MOCK, CATEGORY_MOCK } from '../product-create/mockData';

@Component({
  selector: 'app-product-update',
  standalone: false,
  templateUrl: './product-update.component.html',
  styleUrl: './product-update.component.scss'
})
export class ProductUpdateComponent implements OnInit {

  productId!: string;

  categories: ICategory[] = [];
  brands: ProductBrand[] = [];
  productDetail!: any; // แนะนำให้ทำ interface จริงในโปรเจค


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private stockService: StockManagementService,
    private fileService: FileManagementService,
    private modal: ModalCommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    this.productDetail = {
      name: 'ผ้าเบรกหน้า Toyota Camry',
      description: 'ผ้าเบรกแท้ เกรด OEM สำหรับ Camry ปี 2018–2022',

      categoryId: 'cat-brake-pad',
      brandId: 'brand-toyota',
      status: 'active',

      vehicles: [
        {
          brand: 'Toyota',
          model: 'Camry',
          yearFrom: 2018,
          yearTo: 2022
        }
      ],

      prices: [
        { type: 'RETAIL', amount: 1200 },
        { type: 'WHOLESALE', amount: 950 },
        { type: 'COST', amount: 800 }
      ],

      spec: {
        unit: 'ชุด',
        weight: 3.2,
        width: 25,
        height: 8,
        depth: 18
      },

      images: [
        {
          fileId: 'img-001',
          isPrimary: true
        },
        {
          fileId: 'img-002',
          isPrimary: false
        }
      ]
    };
    await this.loadCategories();
    await this.loadProductDetail();
  }

  // -----------------------------
  // Load initial data
  // -----------------------------

  async loadCategories() {
    try {
      const res = await this.catalogService.getCategories({
        isActive: true,
        isSelectable: true
      });

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.categories = res.resultData;
      }
    } catch (error) {
      console.error(error);
      this.categories = CATEGORY_MOCK;
    }

  }

  async loadProductDetail() {
    try {
      const res = await this.stockService.getProductDetail(this.productId);

      if (res.resultCode !== RESPONSE.SUCCESS) return;

      this.productDetail = res.resultData;
      await this.onCategoryChange(this.productDetail.categoryId);
    } catch (error) {
      console.error(error);
    }

  }

  async onCategoryChange(catId: string): Promise<void> {
    try {
      const params: IQueryCatalogProducts = {
        isActive: true,
        categoriesId: catId
      };
      const res = await this.catalogService.getBrands(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.brands = res.resultData;
      }
    } catch (err) {
      console.error(err);
      this.brands = BRAND_MOCK['cat-brake-pad'];
    }
  }

  async onSubmit(payload: {
    form: IReqCreateProduct;
    images: IUploadImagePayload[];
  }) {
    try {
      const uploadedImages = await this.uploadImages(payload.images);

      const finalPayload: IReqUpdateProduct = {
        ...payload.form,
        images: uploadedImages
      };

      const res = await this.stockService.updateProduct(
        this.productId,
        finalPayload
      );

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.modal.open({
          type: 'success',
          title: 'อัปเดตผลิตภัณฑ์สำเร็จ',
          subtitle: 'ข้อมูลถูกบันทึกเรียบร้อย',
          buttonText: 'ยืนยัน'
        });

        this.router.navigate(['/stock/products']);
      }
    } catch (err) {
      console.error(err);
    }
  }

  onCancel() {
    this.router.navigate(['/portal/product/list']);
  }

  private async uploadImages(images: IUploadImagePayload[]) {
    // mock
    return images.map(img => ({
      fileId: 'mock-' + Math.random(),
      isPrimary: img.isPrimary
    }));
  }
}