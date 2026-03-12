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
  private categoryMap = new Map<string, ICategory>();
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
    await this.initializePermissions();
  }

  private async initializePermissions() {
    this.loadCategories();
    // try {
    //   this.permissions = await this.permissionService.permissions();
    //   this.isViewDetailReport = this.permissionService.isViewDetailReport;
    // this.isDeleteUser=this.permissionService.isDeleteUser;
    // this.isUpdateUser=this.permissionService.isUpdateUser;
    // this.isResetPasswordUser=this.permissionService.isResetPasswordUser;
    //   if (!this.isViewDetailReport) {
    //     this.router.navigate(['/not-found']);
    //   } else {
    //     this.route.queryParams.subscribe(params => this.updateQueryParams(params));
    //   }
    // } catch (error) {
    //   const errorObject = error as { message: string };
    //   if (errorObject.message !== '504') {
    //     this.handleCommonError();
    //   }
    // }
  }

  async loadCategories() {
    try {
      const res = await this.catalogService.getCategories({
        isActive: true,
        // isSelectable: true
      });

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.categories = res.resultData.categories;
        this.buildCategoryMap(this.categories);
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
      const categoryPath = this.getCategoryPath(payload.form.categoryId);
      const finalPayload: IReqCreateProduct = {
        ...payload.form,
        images: uploadedImages,
        categoryPath
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

  private buildCategoryMap(categories: ICategory[]) {
    const stack = [...categories];
    while (stack.length) {
      const cat = stack.pop()!;
      this.categoryMap.set(cat.id, cat);
      if (cat.children?.length) {
        stack.push(...cat.children);
      }
    }
  }

  private getCategoryPath(catId: string): string[] {
    const cat = this.categoryMap.get(catId);
    return cat?.path ?? [];
  }

  private async uploadImages(images: IUploadImagePayload[]) {
    // mock
    return images.map(img => ({
      fileId: 'mock-' + Math.random(),
      url: "https://via.placeholder.com/150",
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