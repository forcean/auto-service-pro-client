import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReceiveStockModalService implements OnDestroy {

  private isOpen$ = new BehaviorSubject<IReceiveStockModal>({
    isOpen: false,
  });

  readonly isOpen = this.isOpen$.asObservable();

  ngOnDestroy(): void {
    this.isOpen$.unsubscribe();
  }

  open(option?: ReceiveStockModalOption): void {
    this.isOpen$.next({
      ...option,
      isOpen: true,
    });
  }

  close(option?: IReceiveStockModal): void {
    this.isOpen$.next({
      ...option,
      isOpen: false,
    });
  }

}

type ReceiveStockModalOption = {
  title?: string;
};

export type IReceiveStockModal =
  Partial<ReceiveStockModalOption> & {
    isOpen: boolean;
  };