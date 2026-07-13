import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IQueryStockMovement } from '../../interface/stock-management.interface';
import { IProducts } from '../../interface/product-list.interface';
import { RESPONSE } from '../../enum/response.enum';
import { ProductService } from '../../services/product.service';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-stock-search',
  standalone: false,
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.scss',
})
export class StockSearchComponent implements OnInit {
  @Output() search = new EventEmitter<IQueryStockMovement>();
  @Output() reset = new EventEmitter<void>();

  searchForm!: FormGroup;

  products: IProducts[] = [];
  users: any[] = [];

  loadingProduct = false;
  loadingUser = false;

  isMobileFilterOpen = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productService: ProductService,
    private readonly userManagementService:UserManagementService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      sku: [''],
      movementType: [''],
      referenceType: [''],
      referenceId: [''],
      createdBy: [''],
      startDate: [''],
      endDate: [''],
    });
    this.searchUser()
  }

  onSubmit(): void {
    this.search.emit(this.searchForm.getRawValue());
  }

  onReset(): void {
    this.searchForm.reset({
      sku: '',
      movementType: '',
      referenceType: '',
      referenceId: '',
      createdBy: '',
      startDate: '',
      endDate: '',
    });

    this.reset.emit();
  }

  toggleFilter(): void {
    this.isMobileFilterOpen = !this.isMobileFilterOpen;
  }

  async searchProduct(keyword: string): Promise<void> {
    if (!keyword.trim()) {
      this.products = [];
      return;
    }
    this.loadingProduct = true;
    try {
      const params: any = {
        sku: keyword,
      };
      const res = await this.productService.getListProduct(params);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.products = res.resultData.products;
      } else {
        // this.handleFailResponse()
      }
    } catch (error) {
      console.error(error);
      // this.handleCommonError()
    } finally {
      this.loadingProduct = false;
    }
  }

  async searchUser(): Promise <void>{
    try {
      const payload = {
        page: 1,
        limit: 20,
        role: ''
      };
      const res = await this.userManagementService.getListUser(payload);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.users = res.resultData?.users || [];
      } else {
      }
      // this.managerList = [
      //   { id: '1', publicId: 'manager1', firstName: 'สมชาย', lastName: 'ใจดี', role: 'MNG', managerName: null, phoneNumber: '0812345678', activeFlag: true, lastAccess: null },
      //   { id: '2', publicId: 'manager2', firstName: 'สมหญิง', lastName: 'แสนสวย', role: 'MNG', managerName: null, phoneNumber: '0898765432', activeFlag: true, lastAccess: null },
      //   { id: '3', publicId: 'manager3', firstName: 'สมปอง', lastName: 'หัวไว', role: 'MNG', managerName: null, phoneNumber: '0823456789', activeFlag: false, lastAccess: null }
      // ];
    } catch (err) {
      console.error('Error loading manager list', err);
    }
  }
}
