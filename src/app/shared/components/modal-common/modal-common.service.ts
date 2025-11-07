import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalCommonService implements OnDestroy {
  private isOpen$ = new BehaviorSubject<IOptionModalCommon>({ isOpen: false });
  isOpen = this.isOpen$.asObservable();

  constructor(
    private router: Router,
  ) { }

  ngOnDestroy(): void {
    this.isOpen$.unsubscribe();
  }

  open(opt: OptionModalCommon) {
    this.isOpen$.next({
      ...opt,
      isOpen: true,
    });
  }

  close(opt: IOptionModalCommon) {
    this.isOpen$.next({
      ...opt,
      isOpen: false,
    });
    // this.router.navigate(['/'])
  }
}

interface OptionModalCommon {
  type?: 'success' | 'error' | 'expire' | 'alert';
  title?: string;
  subtitle?: string;
  buttonText?: string;
  routePage?: string;
  height?: string;
}

export type IOptionModalCommon = Partial<OptionModalCommon> & { isOpen: boolean };
