import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResetPasswordModuleService implements OnDestroy {
  private isOpen$ = new BehaviorSubject<IOptionModalCommon>({ isOpen: false })
  isOpen = this.isOpen$.asObservable();

  constructor(
    private router: Router
  ) { }

  ngOnDestroy(): void {
    this.isOpen$.unsubscribe()
  }

  open(opt: OptionModalCommon) {
    this.isOpen$.next({
      ...opt,
      isOpen: true
    });
  }

  close(opt: IOptionModalCommon) {
    this.isOpen$.next({
      ...opt,
      isOpen: false
    });
    // this.router.navigate(['/'])
  }
}

type OptionModalCommon = {
  type?: 'success' | 'error' | 'expire' | 'alert'
  title?: string
  subtitle?: string
  buttonText?: string
}

export type IOptionModalCommon = Partial<OptionModalCommon> & { isOpen: boolean }
