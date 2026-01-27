import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICategory } from '../../../shared/interface/category.interface';
import { ProductBrand } from '../../../shared/interface/brand.interface';
import { BRAND_MOCK, CATEGORY_MOCK } from './mockData';
import { CatalogService } from '../../../shared/services/catalog.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { IQueryCatalogProducts } from '../../../shared/interface/catalog.interface';
import { IUploadImagePayload } from '../../../shared/interface/file-management.interface';
import { IReqCreateProduct } from '../../../shared/interface/stock-management.interface';
import { FileManagementService } from '../../../shared/services/file-management.service';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { StockManagementService } from '../../../shared/services/stock-management.service';

@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent implements OnInit {
  categories: ICategory[] = [];
  brands: ProductBrand[] = [];

  constructor(
    private catalogService: CatalogService,
    private stockService: StockManagementService,
    private fileService: FileManagementService,
    private modal: ModalCommonService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadCategories();
  }

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

      const finalPayload: IReqCreateProduct = {
        ...payload.form,
        images: uploadedImages
      };

      const res = await this.stockService.createProduct(finalPayload);

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.modal.open({
          type: 'success',
          title: 'สร้างผลิตภัณฑ์สำเร็จ',
          subtitle: 'คุณได้สร้างผลิตภัณฑ์เรียบร้อยแล้ว',
          buttonText: 'ยืนยัน'
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  private async uploadImages(images: IUploadImagePayload[]) {
    // mock
    return images.map(img => ({
      fileId: 'mock-' + Math.random(),
      isPrimary: img.isPrimary
    }));
  }
}