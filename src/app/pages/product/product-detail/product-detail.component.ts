import { Component, model, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockManagementService } from '../../../shared/services/stock-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { IProductDetail, IProductStock, IResponseProductDetail } from '../../../shared/interface/product-management.interface';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private modalSubscription!: Subscription | null;

  product!: IProductDetail;

  mainImageUrl = '';
  galleryImages: any[] = [];
  specEntries: { label: string; value?: string | number }[] = [];

  stockInfo: IProductStock = {
    onHand: 0,
    reserved: 0,
    available: 0,
    minStock: 5
  };

  recentMovements: any[] = [];

  isSkuCopied = false;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stockManagementService: StockManagementService,
    private modalCommonService: ModalCommonService,
  ) { }

  ngOnInit(): void {
    this.loadProduct();
  }

  ngOnDestroy(): void {
    this.unsubscribeModal();
  }

  async loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.router.navigate(['/portal/product/list']);
      return;
    }

    this.isLoading = true;

    try {
      const res = await this.stockManagementService.getProductDetail(productId);

      if (res.resultCode === RESPONSE.SUCCESS) {
        if (res.resultData.product) {
          this.product = res.resultData.product;
          this.stockInfo = res.resultData.stockInfo || this.stockInfo;
          this.recentMovements = res.resultData.recentMovements || [];
        } else {
          this.product = res.resultData.product;

          this.stockInfo = {
            onHand: 0,
            reserved: 0,
            available: 0,
            minStock: 5
          };
        }

        this.patchData();

      } else {
        this.handleCommonError();
      }

    } catch (error) {
      console.error(error);
      this.handleFailResponse();
    } finally {
      this.isLoading = false;
    }
  }

  private patchData() {
    if (!this.product) return;

    const images = this.product.images || [];

    const main = images.find((i: any) => i.isPrimary);
    this.mainImageUrl = main?.url || images[0]?.url || '';

    this.galleryImages = images.filter((i: any) => !i.isPrimary);

    this.specEntries = [
      { label: 'หน่วย: ', value: this.product.spec?.unit },
      { label: 'น้ำหนัก: ', value: this.product.spec?.weight },
      { label: 'กว้าง: ', value: this.product.spec?.width },
      { label: 'สูง: ', value: this.product.spec?.height },
      { label: 'ลึก: ', value: this.product.spec?.depth }
    ].filter(s => s.value !== undefined && s.value !== null);
  }

  get isLowStock(): boolean {
    return this.stockInfo.available <= this.stockInfo.minStock;
  }

  get margin(): number {
    if (!this.product?.prices?.retail || !this.product?.prices?.cost) {
      return 0;
    }

    const margin =
      ((this.product.prices.retail - this.product.prices.cost)
        / this.product.prices.retail) * 100;

    return isNaN(margin) ? 0 : Math.round(margin);
  }

  preview(url: string) {
    this.mainImageUrl = url;
  }

  goEdit() {
    this.router.navigate(['/portal/product/update', this.product.id]);
  }

  goBack() {
    this.router.navigate(['/portal/product/list']);
  }

  copySku() {
    if (!this.product?.code) return;

    navigator.clipboard.writeText(this.product.code);
    this.isSkuCopied = true;

    setTimeout(() => {
      this.isSkuCopied = false;
    }, 1500);
  }

  private handleCommonError() {
    this.modalSubscription =
      this.modalCommonService.isOpen.subscribe((obj) => {
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
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
      buttonText: 'เข้าใจแล้ว',
    });
  }
}