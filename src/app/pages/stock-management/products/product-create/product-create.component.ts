import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICategory } from '../../../../shared/interface/category.interface';
import { ProductBrand } from '../../../../shared/interface/brand.interface';
import { BRAND_MOCK, CATEGORY_MOCK } from './mockData';
import { CatalogService } from '../../../../shared/services/catalog.service';
import { RESPONSE } from '../../../../shared/enum/response.enum';
import { IQueryCatalogProducts } from '../../../../shared/interface/catalog.interface';
import { IUploadImagePayload } from '../../../../shared/interface/file-management.interface';
import { IReqCreateProduct } from '../../../../shared/interface/stock-management.interface';
import { FileManagementService } from '../../../../shared/services/file-management.service';

@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
})
export class ProductCreateComponent implements OnInit {
  form!: FormGroup;
  categories: ICategory[] = [];
  brands: ProductBrand[] = [];
  tempImages: IUploadImagePayload[] = [];

  isVehicleBinding: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private catalogService: CatalogService,
    private fileService: FileManagementService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadMasterData();
    await this.initForm();
  }

  private async initForm(): Promise<void> {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],

      categoryId: ['', Validators.required],
      brandId: ['', Validators.required],

      status: ['active', Validators.required],

      vehicles: this.fb.control([], Validators.required),

      prices: this.fb.array([
        this.createPrice('RETAIL'),
        this.createPrice('WHOLESALE'),
        this.createPrice('COST'),
      ]),

      spec: this.fb.group({
        unit: [''],
        weight: [],
        width: [],
        height: [],
        depth: [],
      }),
      images: this.fb.array([], Validators.required),
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

  get prices(): FormArray {
    return this.form.get('prices') as FormArray;
  }

  get images(): FormArray {
    return this.form.get('images') as FormArray;
  }

  private createPrice(type: 'RETAIL' | 'WHOLESALE' | 'COST'): FormGroup {
    return this.fb.group({
      type: [type],
      amount: [null],
    });
  }

  onImagesChange(images: any[]): void {
    this.tempImages = images;
  }

  private mapToPayload(raw: any): IReqCreateProduct {
    return {
      name: raw.name,
      description: raw.description || undefined,

      categoryId: raw.categoryId,
      brandId: raw.brandId,

      status: raw.status,

      vehicle: raw.vehicles?.length
        ? raw.vehicles.map((v: any) => ({
          vehicleId: v.vehicleId,
          yearRange: {
            from: v.yearFrom,
            to: v.yearTo,
          },
          engines: v.engines,
          remark: v.remark,
        }))
        : undefined,


      prices: raw.prices
        ?.filter((p: any) => p.amount)
        .map((p: any) => ({
          type: p.type,
          amount: Number(p.amount),
        })),

      spec: raw.spec?.unit
        ? {
          unit: raw.spec.unit,
          weight: raw.spec.weight,
          width: raw.spec.width,
          height: raw.spec.height,
          depth: raw.spec.depth,
        } : {},
    };
  }

  async submit(): Promise<void> {
    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }

    try {
      const uploadedImages = await this.uploadAllImages();
      const payload: IReqCreateProduct = this.mapToPayload({
        ...this.form.value,
        images: uploadedImages
      });

      console.log('Create Product Payload:', payload);

      // 3. ยิง create product จริง
      // await this.productService.create(payload);

      // this.router.navigate(['/products']);
    } catch (err) {
      console.error('Create product failed', err);
    }
  }

  private async uploadAllImages(): Promise<
    { fileId: string; isPrimary: boolean }[]
  > {
    if (!this.tempImages.length) {
      throw new Error('No images to upload');
    }

    const res = await this.fileService.uploadImage(this.tempImages);

    if (res.resultCode !== RESPONSE.SUCCESS) {
      throw new Error('Upload images failed');
    }

    return res.resultData.map((img: any) => ({
      fileId: img.fileId,
      isPrimary: img.isPrimary
    }));
  }

  async onSelectedCategory(): Promise<void> {
    this.form.get('brandId')?.reset();
    this.brands = [];
    const catId = this.form.get('categoryId')?.value;
    if (!catId) {
      return;
    }
    const selectedCategory = this.findCategoryById(this.categories, catId);
    this.isVehicleBinding = selectedCategory?.allowVehicleBinding || false;
    this.loadBrands(catId);
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

}

