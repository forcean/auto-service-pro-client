import { Component, model, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockManagementService } from '../../../shared/services/stock-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { IResponseProductDetail } from '../../../shared/interface/product-management.interface';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {

  private modalSubscription!: Subscription | null;
  product!: IResponseProductDetail;
  mainImageUrl = '';
  galleryImages: any[] = [];
  specEntries: { label: string; value?: string | number }[] = [];

  isSkuCopied: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private stockManagementService: StockManagementService,
    private modalCommonService: ModalCommonService,
  ) { }

  ngOnInit(): void {
    this.loadProduct();
  }

  async loadProduct() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.router.navigate(['/portal/product/list']);
      return;
    }

    try {
      const res = await this.stockManagementService.getProductDetail(productId);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.product = res.resultData;
        this.patchData();
      } else {
        this.handleCommonError();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private patchData() {
    const main = this.product.images.find((i: any) => i.isPrimary);
    this.mainImageUrl = main?.url || '';

    this.galleryImages = this.product.images.filter((i: any) => !i.isPrimary);

    this.specEntries = [
      { label: 'หน่วย', value: this.product.spec?.unit },
      { label: 'น้ำหนัก (kg)', value: this.product.spec?.weight },
      { label: 'กว้าง (mm)', value: this.product.spec?.width },
      { label: 'สูง (mm)', value: this.product.spec?.height },
      { label: 'ลึก (mm)', value: this.product.spec?.depth }
    ].filter(s => s.value);
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
    if (!this.product?.code) {
      return;
    }

    navigator.clipboard.writeText(this.product.code);
    this.isSkuCopied = true;
    setTimeout(() => {
      this.isSkuCopied = false;
    }, 1500);
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
