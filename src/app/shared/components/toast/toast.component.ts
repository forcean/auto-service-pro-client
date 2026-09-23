import { Component } from '@angular/core';
import { IToast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  constructor(private readonly toastService: ToastService) {}

  get toasts$() {
    return this.toastService.toasts$;
  }

  dismiss(toast: IToast): void {
    this.toastService.dismiss(toast.id);
  }

  icon(type: IToast['type']): string {
    return { success: '✓', error: '!', warning: '!', info: 'i' }[type];
  }

  trackByToastId(_: number, toast: IToast): number {
    return toast.id;
  }
}
