import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface IToast {
  id: number;
  message: string;
  type: ToastType;
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<IToast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  readonly toasts$ = this.toastsSubject.asObservable();

  success(message: string, title = 'สำเร็จ'): number {
    return this.show(message, 'success', title);
  }

  error(message: string, title = 'ไม่สามารถทำรายการได้'): number {
    return this.show(message, 'error', title, 6000);
  }

  warning(message: string, title = 'โปรดตรวจสอบ'): number {
    return this.show(message, 'warning', title);
  }

  info(message: string, title = 'ข้อมูล'): number {
    return this.show(message, 'info', title);
  }

  show(message: string, type: ToastType = 'info', title?: string, duration = 4500): number {
    const id = ++this.nextId;
    this.toastsSubject.next([...this.toastsSubject.value, { id, message, type, title }]);

    if (duration > 0) {
      this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
    }
    return id;
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }
}
