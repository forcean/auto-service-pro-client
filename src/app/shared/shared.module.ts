import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ModalCommonComponent } from './components/modal-common/modal-common.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MaskValueComponent } from './components/mask-value/mask-value.component';
import { StrongPasswordInputComponent } from './components/strong-password-input/strong-password-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomOptionComponent } from './components/custom-option/custom-option.component';
import { CustomSelectComponent } from './components/custom-select/custom-select.component';
import { ResetPasswordModuleComponent } from './components/reset-password-modal/reset-password-modal.component';
import { ModalConditionComponent } from './components/modal-condition/modal-condition.component';
import { NumericDirective } from './directive/numeric.directive';
import { PreventSpaceDirective } from './directive/preventspace.directive';
import { TableUserManagementComponent } from './components/table-user-management/table-user-management.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchUserManagementComponent } from './components/search-user-management/search-user-management.component';
import { ContentTitleComponent } from './components/content-title/content-title.component';
import { LazyLoadTableComponent } from './lazy-load/lazy-load-table/lazy-load-table.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CustomCategoryOptionComponent } from './components/custom-category-option/custom-category-option.component';
import { CustomBrandOptionComponent } from './components/custom-brand-option/custom-brand-option.component';
import { VehicleCardComponent } from './components/vehicle-card/vehicle-card.component';
import { VehicleStepSelectorComponent } from './components/vehicle-step-selector/vehicle-step-selector.component';
import { VehicleCompatibilityComponent } from './components/vehicle-compatibility/vehicle-compatibility.component';
import { DecimalDirective } from './directive/app-decimal.directive';
import { PreventSpecialCharsDirective } from './directive/preventspecialchars.directive';
import { PriceDirective } from './directive/app-price.directive';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { CustomSelectCategoryComponent } from './components/custom-select-category/custom-select-category.component';
import { SpecInputDirective } from './directive/spec-input.directive';
import { StockSearchComponent } from './components/stock-search/stock-search.component';
import { StockSummaryComponent } from './components/stock-summary/stock-summary.component';
import {
  ArrowRightLeft,
  ArrowUpFromDot,
  CarFront,
  ChevronDown,
  ChevronsDown,
  ChevronUp,
  Download,
  Eye,
  List,
  LucideAngularModule,
  PackagePlus,
  RotateCcw,
  RotateCw,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  Image,
  StickyNote,
  Check,
  Receipt,
  Settings2,
  Calendar,
  Wrench,
  Wallet,
  CalendarCheck,
  FolderOpen,
  Activity,
  AlertTriangle,
  AlertCircle,
  Clock,
  Info,
  CheckCircle2,
  History,
  File,
  Archive,
  FileType2,
  Sheet
} from 'lucide-angular';
import { TableStockManagementComponent } from './components/table-stock-management/table-stock-management.component';
import { CustomSearchSelectComponent } from './components/custom-search-select/custom-search-select.component';
import { ReceiveStockModalComponent } from './components/receive-stock-modal/receive-stock-modal.component';
import { TableVehicleListComponent } from './components/table-vehicle-list/table-vehicle-list.component';
import { SearchVehicleComponent } from './components/search-vehicle/search-vehicle.component';
import { VehicleOverviewComponent } from './components/vehicle-overview/vehicle-overview.component';
import { TableVehicleServiceHistoryComponent } from './components/table-vehicle-service-history/table-vehicle-service-history.component';
import { VehicleWorkOrdersComponent } from './components/vehicle-work-orders/vehicle-work-orders.component';
import { VehicleDocumentsComponent } from './components/vehicle-documents/vehicle-documents.component';
import { ImageGalleryComponent } from './components/image-gallery/image-gallery.component';
import { ServiceHistoryPanelComponent } from './components/service-history-panel/service-history-panel.component';
import { ProvincePipe } from './pipes/province.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

const components = [
  ModalCommonComponent,
  ProfileComponent,
  MaskValueComponent,
  StrongPasswordInputComponent,
  CustomOptionComponent,
  CustomSelectComponent,
  ResetPasswordModuleComponent,
  ModalConditionComponent,
  TableUserManagementComponent,
  PaginationComponent,
  SearchUserManagementComponent,
  ContentTitleComponent,
  LazyLoadTableComponent,
  ProductCardComponent,
  ProductFilterComponent,
  FileUploadComponent,
  CustomBrandOptionComponent,
  VehicleCardComponent,
  VehicleStepSelectorComponent,
  VehicleCompatibilityComponent,
  ProductFormComponent,
  CustomCategoryOptionComponent,
  CustomSelectCategoryComponent,
  StockSearchComponent,
  StockSummaryComponent,
  TableStockManagementComponent,
  CustomSearchSelectComponent,
  ReceiveStockModalComponent,
  TableVehicleListComponent,
  VehicleOverviewComponent,
  TableVehicleServiceHistoryComponent,
  VehicleWorkOrdersComponent,
  VehicleDocumentsComponent,
  ImageGalleryComponent,
  ServiceHistoryPanelComponent,
];

const directives = [
  NumericDirective,
  PreventSpaceDirective,
  DecimalDirective,
  PreventSpecialCharsDirective,
  PriceDirective,
  SpecInputDirective,
  SearchVehicleComponent,
];

@NgModule({
  declarations: [...components, ...directives],
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({
      ArrowUpFromDot,
      RotateCcw,
      ChevronDown,
      ArrowRightLeft,
      List,
      Search,
      SlidersHorizontal,
      ChevronUp,
      PackagePlus,
      RotateCw,
      ChevronsDown,
      CarFront,
      Upload,
      Image,
      Eye,
      Download,
      Trash2,
      Wrench,
      Wallet,
      CalendarCheck,
      FolderOpen,
      Activity,
      AlertCircle,
      AlertTriangle,
      Clock,
      Info,
      CheckCircle2,
      Calendar,
      Settings2,
      History,
      Receipt,
      Check,
      StickyNote,
      File,
      Archive,
      FileType2,
      Sheet
    }),
    ProvincePipe,
    TimeAgoPipe,
  ],
  exports: [...components, ...directives],
})
export class SharedModule {}
