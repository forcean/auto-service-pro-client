import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ICategory } from '../../../shared/interface/category.interface';
import { ProductBrand } from '../../../shared/interface/brand.interface';
import { IPrices, IReqCreateProduct } from '../../interface/product-management.interface';
import { IUploadImagePayload } from '../../interface/file-management.interface';
import { skip, Subscription } from 'rxjs';
import { IProducts } from '../../interface/product-list.interface';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnChanges {

  @Input() mode: 'create' | 'update' = 'create';
  @Input() categories: ICategory[] = [];
  @Input() brands: ProductBrand[] = [];
  @Input() initialData!: IProducts;

  @Output() categoryChange = new EventEmitter<string>();
  @Output() submitForm = new EventEmitter<{
    form: IReqCreateProduct;
    images: IUploadImagePayload[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  private categorySub!: Subscription;
  form!: FormGroup;
  isVehicleBinding: boolean = false;
  isFormSubmitted: boolean = false;
  isLoadedBrands: boolean = false;
  priceTypeLabelMap: Record<string, string> = {
    RETAIL: 'ราคาขายปลีก',
    WHOLESALE: 'ราคาขายส่ง',
    COST: 'ราคาทุน',
  };
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.form.get('vehicles')?.valueChanges.subscribe(v => {
      console.log('vehicles changed:', v);
    });
    this.categorySub = this.form.get('categoryId')!
      .valueChanges
      .subscribe(() => {
        if (this.mode === 'update' && !this.form.dirty) return;
        this.onSelectedCategory();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData']?.currentValue) {
      console.log('initialData:', changes['initialData'].currentValue);
      console.log('initialData.vehicle:', changes['initialData'].currentValue.vehicle);
      this.patchForm(changes['initialData'].currentValue);
      const catId = this.form.get('categoryId')?.value;
      const selectedCategory = this.findCategoryById(this.categories, catId);
      this.isVehicleBinding = selectedCategory?.allowVehicleBinding || false;
      this.isLoadedBrands = true;
    }
  }

  ngOnDestroy() {
    this.categorySub?.unsubscribe();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categoryId: ['', Validators.required],
      brandId: ['', Validators.required],
      status: ['active', Validators.required],
      vehicles: this.fb.control([]),
      prices: this.fb.array(
        [
          this.createPrice('RETAIL'),
          this.createPrice('WHOLESALE'),
          this.createPrice('COST'),
        ],
        { validators: this.atLeastOnePriceValidator() }
      ),
      spec: this.fb.group({
        unit: [''],
        weight: [''],
        width: [''],
        height: [''],
        depth: [''],
      }),
      images: [[], Validators.required],
    });
  }

  private patchForm(data: any): void {
    this.form.patchValue({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId,
      status: data.status,
      vehicles: data.vehicles ?? [],
      spec: data.spec ?? {},
      images: data.images ?? []
    });

    const pricesFA = this.form.get('prices') as FormArray;
    pricesFA.clear();

    (data.prices ?? []).forEach((p: any) => {
      pricesFA.push(
        this.fb.group({
          type: [p.type],
          amount: [p.amount],
        })
      );
    });
  }

  private createPrice(type: 'RETAIL' | 'WHOLESALE' | 'COST'): FormGroup {
    return this.fb.group({
      type: [type],
      amount: [
        null,
        [
          Validators.min(0),
        ]
      ],
    });
  }

  private atLeastOnePriceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (!(control instanceof FormArray)) {
        return null;
      }

      const hasPrice = control.controls.some(ctrl => {
        const value = ctrl.get('amount')?.value;
        return value !== null && value !== '' && Number(value) > 0;
      });

      return hasPrice ? null : { atLeastOnePrice: true };
    };
  }

  get prices(): FormArray {
    return this.form.get('prices') as FormArray;
  }

  isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.touched || this.isFormSubmitted));
  }

  onImagesChange(images: any[]): void {
    this.form.get('images')?.setValue(images);
    this.form.get('images')?.markAsTouched();
  }

  onSelectedCategory(): void {
    if (this.mode === 'update' && !this.form.dirty) return;

    const catId = this.form.get('categoryId')?.value;
    if (!catId) return;

    this.categoryChange.emit(catId);
    this.isLoadedBrands = true;
    const selectedCategory = this.findCategoryById(this.categories, catId);
    this.isVehicleBinding = selectedCategory?.allowVehicleBinding || false;

    const vehiclesCtrl = this.form.get('vehicles');

    if (this.isVehicleBinding) {
      vehiclesCtrl?.setValidators([Validators.required]);
    } else {
      vehiclesCtrl?.clearValidators();

      if (this.mode !== 'update') {
        vehiclesCtrl?.setValue([]);
      }
    }


    vehiclesCtrl?.updateValueAndValidity();
  }

  submit(): void {
    this.isFormSubmitted = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    this.submitForm.emit({
      form: payload,
      images: this.form.get('images')?.value || []
    });
  }


  onCancel(): void {
    this.cancel.emit();
  }

  private buildPayload(): IReqCreateProduct {
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
          yearFrom: v.yearFrom,
          yearTo: v.yearTo,
          remark: v.remark,
          engines: v.selectedEngines ?? v.engines,
        }))
      }),
      ...(f.prices?.some((p: any) => p.amount) && {
        prices: f.prices.filter((p: any) => p.amount)
      }),

      ...(f.spec && Object.values(f.spec).some(v => v) && { spec: f.spec }),
    };
  }

  private findCategoryById(categories: ICategory[], id: string): ICategory | null {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.children?.length) {
        const found = this.findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  }
}