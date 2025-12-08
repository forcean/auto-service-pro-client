import { Injectable, OnDestroy } from '@angular/core';
// import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalConditionService implements OnDestroy {
  private isOpen$ = new BehaviorSubject<IOptionModalCondition>({ isOpen: false })
  isOpen = this.isOpen$.asObservable();

  constructor(
    // private router: Router
  ) { }

  ngOnDestroy(): void {
    this.isOpen$.unsubscribe()
  }

  open(opt: OptionModalCondition) {
    
    this.isOpen$.next({
      ...opt,
      isOpen: true
    })
  }

  close(opt: IOptionModalCondition) {
    this.isOpen$.next({
      ...opt,
      isOpen: false
    })
  }
}

type OptionModalCondition = {
  type?: 'change' | 'reset' | 'active'
  title?: string
  subtitle?: string
  submitText?: string
}

export type IOptionModalCondition = Partial<OptionModalCondition> & { isOpen: boolean }
