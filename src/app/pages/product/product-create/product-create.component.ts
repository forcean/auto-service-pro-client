import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CatalogService } from '../../../shared/services/catalog.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ICategory, IProductBrand, IQueryCatalogProducts } from '../../../shared/interface/catalog.interface';
import { IUploadImagePayload } from '../../../shared/interface/file-management.interface';
import { IReqCreateProduct } from '../../../shared/interface/product-management.interface';
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

  private modalSubscription!: Subscription | null;
  categories: ICategory[] = [];
  brands: IProductBrand[] = [];

  constructor(
    private catalogService: CatalogService,
    private stockService: StockManagementService,
    private fileService: FileManagementService,
    private modalCommonService: ModalCommonService,
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
        this.categories = res.resultData.category;
      } else {
        this.handleCommonError();
      }
    } catch (error) {
      console.error(error);
      this.handleCommonError();
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
        this.brands = res.resultData.brands;
      } else {
        this.handleCommonError();
      }
    } catch (err) {
      console.error(err);
      this.handleCommonError();
    }
  }

  onCancel() {
    this.router.navigate(['/portal/product/list']);
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
        this.handleModalSuccess();
      } else {
        this.handleFailResponse()
      }
    } catch (err) {
      console.error(err);
      this.handleCommonError();
    }
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
      title: 'สร้างผลิตภัณฑ์สำเร็จ',
      subtitle: 'คุณได้สร้างผลิตภัณฑ์เรียบร้อยแล้ว',
      buttonText: 'ยืนยัน'
    });
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/product/list']);
        this.unsubscribeModal();
      }
    });
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/product/list']);
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