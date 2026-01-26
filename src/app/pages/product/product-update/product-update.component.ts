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
  form!: FormGroup;
  categories: ICategory[] = [];
  brands: ProductBrand[] = [];
  tempImages: IUploadImagePayload[] = [];
  private modalSubscription: Subscription | null = null;

  isVehicleBinding: boolean = false;
  formSubmitted = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private catalogService: CatalogService,
    private fileService: FileManagementService,
    private modalCommonService: ModalCommonService,
    private stockManagementService: StockManagementService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadMasterData();
    await this.initForm();
    await this.loadProductDetail();
  }

  private async initForm(): Promise<void> {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categoryId: ['', Validators.required],
      brandId: ['', Validators.required],
      status: ['', Validators.required],

      vehicles: this.fb.control([]),

      prices: this.fb.array([]),

      spec: this.fb.group({
        unit: [''],
        weight: [],
        width: [],
        height: [],
        depth: [],
      }),

      images: [[], Validators.required],
    });
  }

  private async loadMasterData(): Promise<void> {
    try {
      const params: IQueryCatalogProducts = {
        isActive: true,
        isSelectable: true
      };
      const res = await this.catalogService.getCategories(params);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.categories = res.resultData;
      } else {
        this.categories = CATEGORY_MOCK;
      }
    } catch (error) {
      this.categories = CATEGORY_MOCK;
      console.error(error);
    }
  }


  async loadProductDetail(): Promise<void> {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) return;

    const res = await this.stockManagementService.getProductDetail(productId);

    if (res.resultCode !== RESPONSE.SUCCESS) return;

    const product = res.resultData;

    // 🔹 category → ต้องรู้ก่อนเพื่อ set vehicle validator
    this.form.patchValue({
      name: product.name,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      status: product.status,
      vehicles: product.vehicles ?? [],
      spec: product.spec ?? {},
      images: product.images ?? [],
    });

    this.setVehicleValidatorByCategory(product.categoryId);

    this.setPrices(product.prices);
  }

  private setVehicleValidatorByCategory(catId: string): void {
    const selectedCategory = this.findCategoryById(this.categories, catId);
    this.isVehicleBinding = selectedCategory?.allowVehicleBinding || false;

    const vehiclesCtrl = this.form.get('vehicles');

    if (this.isVehicleBinding) {
      vehiclesCtrl?.setValidators([Validators.required]);
    } else {
      vehiclesCtrl?.clearValidators();
      vehiclesCtrl?.setValue([]);
    }

    vehiclesCtrl?.updateValueAndValidity();
  }
  get prices(): FormArray {
    return this.form.get('prices') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.touched || this.formSubmitted));
  }

  getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (!control || !control.errors) return null;

    if (control.errors['required']) {
      return 'กรุณากรอกข้อมูล';
    }

    return null;
  }


  onImagesChange(images: any[]): void {
    this.tempImages = images;
    this.form.get('images')?.setValue(images);
    this.form.get('images')?.markAsTouched();
  }

  private setPrices(prices: any[]): void {
    const pricesFA = this.form.get('prices') as FormArray;
    pricesFA.clear();

    prices.forEach(p => {
      pricesFA.push(
        this.fb.group({
          type: [p.type],
          amount: [p.amount],
        })
      );
    });
  }

  private buildCreateProductPayload(
    images: { fileId: string; isPrimary: boolean }[]
  ): IReqUpdateProduct {

    const f = this.form.value;

    return {
      name: f.name,
      categoryId: f.categoryId,
      brandId: f.brandId,
      status: f.status,

      ...(f.description?.trim() && { description: f.description.trim() }),

      ...(f.vehicles?.length && {
        vehicle: f.vehicles.map((v: any) => ({
          vehicleId: v.vehicleId,
          ...(v.yearFrom || v.yearTo ? {
            yearRange: {
              ...(v.yearFrom && { from: v.yearFrom }),
              ...(v.yearTo && { to: v.yearTo }),
            }
          } : {}),
          ...(v.engines?.length && { engines: v.engines }),
          ...(v.remark?.trim() && { remark: v.remark.trim() }),
        })),
      }),

      ...(f.prices?.some((p: any) => p.amount) && {
        prices: f.prices
          .filter((p: any) => p.amount)
          .map((p: any) => ({
            type: p.type,
            amount: Number(p.amount),
          })),
      }),

      ...(f.spec && Object.values(f.spec).some((v: any) => v) && {
        spec: {
          ...(f.spec.unit && { unit: f.spec.unit }),
          ...(f.spec.weight && { weight: f.spec.weight }),
          ...(f.spec.width && { width: f.spec.width }),
          ...(f.spec.height && { height: f.spec.height }),
          ...(f.spec.depth && { depth: f.spec.depth }),
        },
      }),

      ...(images?.length && { images }),
    };
  }

  private async uploadAllImages():
    Promise<
      { fileId: string; isPrimary: boolean }[]> {
    if (!this.tempImages.length) {
      throw new Error('No images to upload');
    }

    // const res = await this.fileService.uploadImage(this.tempImages);

    // if (res.resultCode !== RESPONSE.SUCCESS) {
    //   throw new Error('Upload images failed');
    // }

    // return res.resultData.map((img: any) => ({
    //   fileId: img.fileId,
    //   isPrimary: img.isPrimary
    // }));
    // Mocked upload response
    return this.tempImages.map(img => ({
      fileId: 'mocked-file-id-' + Math.random().toString(36).substring(2, 15),
      isPrimary: img.isPrimary
    }));
  }

  async submit(): Promise<void> {
    this.formSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    try {
      const uploadedImages = await this.uploadAllImages();
      const payload = this.buildCreateProductPayload(uploadedImages);

      const productId = this.route.snapshot.paramMap.get('id')!;
      const res = await this.stockManagementService.updateProduct(productId, payload);

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleModalSuccess();
      }
    } catch (err) {
      console.error(err);
      this.handleFailResponse();
    }
  }

  async onSelectedCategory(): Promise<void> {
    this.form.get('brandId')?.reset();
    this.brands = [];

    const catId = this.form.get('categoryId')?.value;
    if (!catId) return;

    const selectedCategory = this.findCategoryById(this.categories, catId);
    this.isVehicleBinding = selectedCategory?.allowVehicleBinding || false;

    const vehiclesCtrl = this.form.get('vehicles');

    if (this.isVehicleBinding) {
      vehiclesCtrl?.setValidators([Validators.required]);
    } else {
      vehiclesCtrl?.clearValidators();
      vehiclesCtrl?.setValue([]);
    }
    vehiclesCtrl?.updateValueAndValidity();
    await this.loadBrands(catId);
  }

  async loadBrands(catId: string): Promise<void> {
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

  private findCategoryById(
    categories: ICategory[],
    id: string
  ): ICategory | null {
    for (const cat of categories) {
      if (cat.id === id) {
        return cat;
      }

      if (cat.children?.length) {
        const found = this.findCategoryById(cat.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/stock-management/products']);
        this.unsubscribeModal();
      }
    });
  }

  // private handleCommonSuccess() {
  //   this.modalCommonService.open({
  //     type: 'success',
  //     title: 'สร้างผู้ใช้งานสำเร็จ',
  //     subtitle: 'คุณได้สร้างผู้ใช้งานในองค์กรเรียบร้อยแล้ว',
  //     buttonText: 'ยืนยัน'
  //   });
  //   this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
  //     if (!obj?.isOpen) {
  //       this.router.navigate(['/portal/corporate-admin/account']);
  //       this.unsubscribeModal();
  //     }
  //   });
  // }

  private handleModalSuccess() {
    this.modalCommonService.open({
      type: 'success',
      title: 'สร้างผลิตภัณฑ์สำเร็จ',
      subtitle: 'คุณได้สร้างผลิตภัณฑ์เรียบร้อยแล้ว',
      buttonText: 'ยืนยัน'
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
