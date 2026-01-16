import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ICategory } from '../../../../shared/interface/category.interface';
import { ProductBrand } from '../../../../shared/interface/brand.interface';

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
  isVehicleBinding: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
  }

  private initForm(): void {
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

  tempImages: {
    tempId: string;
    file: File;
    isPrimary: boolean;
  }[] = [];

  onTempImageAdded(event: {
    tempId: string;
    file: File;
    isPrimary: boolean;
  }): void {
    this.tempImages.push(event);
  }

  submit(): void {
    console.log('test');

    // if (this.form.invalid) {
    //   this.form.markAllAsTouched();
    //   return;
    // }

    const payload = this.mapToPayload(this.form.value);
    console.log('Create Product Payload:', payload);

  }

  private mapToPayload(raw: any): any {
    return {
      name: raw.name,
      description: raw.description || undefined,

      categoryId: raw.categoryId,
      brandId: raw.brandId,

      status: raw.status,

      vehicles: raw.vehicles?.length
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
        }
        : undefined,

      images: this.tempImages.map(img => ({
        file: img.file,
        isPrimary: img.isPrimary,
      })),

    };
  }

  private loadMasterData(): void {
    this.categories = [
      {
        id: 'cat-brake',
        name: 'Brake',
        slug: 'brake',
        code: 'BRAKE',
        level: 1,
        path: ['BRAKE'],
        isSelectable: false,
        allowVehicleBinding: false,
        allowStock: false,
        children: [
          {
            id: 'cat-brake-pad',
            name: 'Brake Pad',
            slug: 'brake-pad',
            code: 'BRKP',
            level: 2,
            path: ['BRAKE', 'BRKP'],
            isSelectable: true,
            allowVehicleBinding: true,
            allowStock: true,
            children: []
          },
          {
            id: 'cat-brake-disc',
            name: 'Brake Disc',
            slug: 'brake-disc',
            code: 'BRKD',
            level: 2,
            path: ['BRAKE', 'BRKD'],
            isSelectable: true,
            allowVehicleBinding: true,
            allowStock: true,
            children: []
          }
        ]
      },
      {
        id: 'cat-engine',
        name: 'Engine',
        slug: 'engine',
        code: 'ENG',
        level: 1,
        path: ['ENG'],
        isSelectable: false,
        allowVehicleBinding: false,
        allowStock: false,
        children: [
          {
            id: 'cat-oil-filter',
            name: 'Oil Filter',
            slug: 'oil-filter',
            code: 'OILF',
            level: 2,
            path: ['ENG', 'OILF'],
            isSelectable: false,
            allowVehicleBinding: false,
            allowStock: false,
            children: [
              {
                id: 'cat-oil-filter-1',
                name: 'Oil Filter 1',
                slug: 'oil-filter-1',
                code: 'OILF1',
                level: 3,
                path: ['ENG', 'OILF', 'OILF1'],
                isSelectable: true,
                allowVehicleBinding: true,
                allowStock: true,
                children: []
              }
            ]
          }
        ]
      }
    ];
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
    try {
      if (catId === 'cat-brake-pad') {
        this.brands = [{ id: 'brand-abc', name: 'Brand ABC', code: 'ABC' }];
      } else if (catId === 'cat-oil-filter-1') {
        this.brands = [{ id: 'brand-xyz', name: 'Brand XYZ', code: 'XYZ' }];
      }
    } catch (err) {
      console.error(err);
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

