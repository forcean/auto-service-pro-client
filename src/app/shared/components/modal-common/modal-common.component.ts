import { Component } from '@angular/core';
import { IOptionModalCommon, ModalCommonService } from './modal-common.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-common',
  standalone: false,
  templateUrl: './modal-common.component.html',
  styleUrl: './modal-common.component.scss',
})
export class ModalCommonComponent {
  optionModal!: IOptionModalCommon;
  private subscription!: Subscription;

  constructor(
    private modalCommonService: ModalCommonService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.subscription = this.modalCommonService.isOpen.subscribe((t) => {
      this.optionModal = t;

      if (t.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    document.body.style.overflow = '';
  }

  onButtonClick() {
    this.modalCommonService.close(this.optionModal);
    if (this.optionModal.type === 'expire') {
      this.router.navigate(['/']);
    }
    if (this.optionModal.routePage) {
      this.router.navigate([this.optionModal.routePage]);
    }
  }
}
