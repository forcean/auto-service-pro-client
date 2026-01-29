import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ICategory } from '../../../shared/interface/category.interface';
import { ProductBrand } from '../../../shared/interface/brand.interface';
import { CatalogService } from '../../../shared/services/catalog.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { IQueryCatalogProducts } from '../../../shared/interface/catalog.interface';
import { IUploadImagePayload } from '../../../shared/interface/file-management.interface';
import { IReqCreateProduct, IReqUpdateProduct } from '../../../shared/interface/product-management.interface';
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

  private modalSubscription!: Subscription | null;
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
    private modalCommonService: ModalCommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.productId = this.route.snapshot.paramMap.get('id')!;
    await this.loadProductDetail();
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
      } else {
        this.handleCommonError();
      }
    } catch (error) {
      console.error(error);
    }

  }

  async loadProductDetail() {
    try {
      const res = await this.stockService.getProductDetail(this.productId);

      if (res.resultCode == RESPONSE.SUCCESS) {
        this.productDetail = res.resultData;
        await this.onCategoryChange(this.productDetail.categoryId);
      } else {
        return;
      }
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
      } else {
        this.handleCommonError();
      }
    } catch (err) {
      console.error(err);
      this.handleCommonError();
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
        this.handleModalSuccess();
      } else {
        this.handleFailResponse()
      }
    } catch (err) {
      console.error(err);
    }
  }

  onCancel() {
    this.router.navigate(['/portal/product/detail', this.productId]);
  }

  private async uploadImages(images: IUploadImagePayload[]) {
    // mock
    return images.map(img => ({
      fileId: 'mock-' + Math.random(),
      isPrimary: img.isPrimary
    }));
  }

  private handleModalSuccess() {
    this.modalCommonService.open({
      type: 'success',
      title: 'สร้างแก้ไขผลิตภัณฑ์สำเร็จ',
      subtitle: 'คุณได้แก้ไขผลิตภัณฑ์เรียบร้อยแล้ว',
      buttonText: 'ยืนยัน'
    });
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/product/detail', this.productId]);
        this.unsubscribeModal();
      }
    });
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/product/detail', this.productId]);
        this.unsubscribeModal();
      }
    });
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });
  }
}