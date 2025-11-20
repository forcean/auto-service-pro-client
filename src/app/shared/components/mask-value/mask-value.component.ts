import { Component, HostListener, OnInit } from '@angular/core';
import { MaskValueService } from './mask-value.service';
import { Router, NavigationEnd } from '@angular/router';
import { ModalCommonService } from '../modal-common/modal-common.service';
import { RESPONSE } from '../../enum/response.enum';

@Component({
  selector: 'mask-value',
  standalone: false,
  templateUrl: './mask-value.component.html',
  styleUrls: ['./mask-value.component.scss']
})
export class MaskValueComponent implements OnInit {
  maskStage = '';
  showMask: boolean = false;
  previousUrl: string = '';
  previousMaskStage: string = '';
  // maskLogBody: IMaskLogDataAll | null = null;

  constructor(
    private maskValueService: MaskValueService,
    private router: Router,
    private modalCommonService: ModalCommonService,
  ) { }

  ngOnInit() {
    // this.maskValueService.bodyData$.subscribe(body => {
    //   // this.maskLogBody = body;
    // });

    this.maskValueService.maskStage.subscribe(stage => {
      this.maskStage = stage;
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentPath = this.router.url.split('?')[0];
        const previousPath = this.previousUrl ? this.previousUrl.split('?')[0] : '';
        if (currentPath !== previousPath) {
          this.resetMaskValue();
        }
        this.previousUrl = this.router.url;
      }
    });
  }

  resetMaskValue() {
    this.maskValueService.setMask('mask');
  }

  // onMaskChange() {
  //   if (this.maskStage === 'mask') {
  //     this.maskStage = 'unmask';
  //     if (this.maskLogBody) {
  //       const currentDate = new Date();
  //       currentDate.setHours(currentDate.getHours() + 7);
  //       this.maskLogBody.accessDate = currentDate.toISOString().replace('Z', '+07:00');
  //       this.maskLogData(this.maskLogBody);
  //     }
  //   } else {
  //     this.maskValueService.toggleMaskStage();
  //   }
  // }

  // private async maskLogData(body: IMaskLogDataAll) {
  //   try {
  //     const res = await this.maskValueService.maskLogData(body);
  //     if (res.resultCode === RESPONSE.SUCCESS) {
  //       this.maskValueService.toggleMaskStage();
  //     } else if (res.resultCode === RESPONSE.INVALID_CREDENTIALS) {
  //       this.router.navigateByUrl('/not-found');
  //       this.maskValueService.setMask('mask');
  //     } else {
  //       this.maskValueService.setMask('mask');
  //     }
  //   } catch (error) {
  //     this.maskValueService.setMask('mask');
  //   }
  // }

  toggleShowMask() {
    this.showMask = !this.showMask;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.container-mask')) {
      this.showMask = false;
    }
  }
}
