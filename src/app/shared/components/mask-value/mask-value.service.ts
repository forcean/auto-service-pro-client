import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { BehaviorSubject, Subscription } from 'rxjs';

import { ModalCommonService } from "../modal-common/modal-common.service";
import { IMenu } from "../../interface/sidebar.interface";
import { ApiPrefix } from "../../enum/api-prefix.enum";
import { HttpService } from "../../../core/services/http-service/http.service";
import { AuthenticationService } from "../../../core/services/authentication/authentication.service";


@Injectable({
  providedIn: 'root'
})
export class MaskValueService {
  private modalSubscription: Subscription | null = null;
  private currentStage$ = new BehaviorSubject<string>('mask');
  maskStage = this.currentStage$.asObservable();

  // private bodyDataSubject = new BehaviorSubject<IMaskLogDataAll | null>(null);
  // bodyData$ = this.bodyDataSubject.asObservable();

  private currentErrorState$ = new BehaviorSubject<{ hasError: boolean; resultCode?: string }>({ hasError: false });
  errorState$ = this.currentErrorState$.asObservable();

  private allEndpoints: IMenu[] = [];

  private PREFIX_USER = ApiPrefix.ServiceManagement;

  constructor(
    private httpService: HttpService,
    private router: Router,
    private modalCommonService: ModalCommonService,
    private authService: AuthenticationService,
  ) {
    const savedEndpoints = localStorage.getItem('allEndpoints');
    if (savedEndpoints) {
      this.allEndpoints = JSON.parse(savedEndpoints);
    }
  }

  getMaskStage(): string {
    return this.currentStage$.getValue();
  }

  toggleMaskStage() {
    const newStage = this.currentStage$.getValue() === 'mask' ? 'unmask' : 'mask';
    this.currentStage$.next(newStage);
  }

  setMask(mask: string) {
    this.currentStage$.next(mask)
  }

  setErrorState(hasError: boolean, resultCode?: string) {
    this.currentErrorState$.next({ hasError, resultCode });
  }

  // setBodyData(data: IMaskLogDataAll) {
  //   this.bodyDataSubject.next(data);
  // }

  setAllEndpoints(endpoints: IMenu[]) {
    this.allEndpoints = endpoints;
    localStorage.setItem('allEndpoints', JSON.stringify(endpoints));
  }

  async getAllEndpoints() {
    return this.allEndpoints;
  }

  // async maskLogData(body: IMaskLogDataAll): Promise<IBaseResponse<any>> {
  //   try {
  //     const uri = this.PREFIX_USER + `/maskLogData`;
  //     const response = await this.httpService.post<IBaseResponse<any>>(uri, body);
  //     if (response.resultCode === RESPONSE.SUCCESS) {
  //       this.setErrorState(false, response.resultCode);
  //     } else {
  //       this.setErrorState(true, response.resultCode);
  //     }

  //     return response;
  //   } catch (error) {
  //     let resultCode = 'UNKNOWN_ERROR_CODE';

  //     if (error instanceof HttpErrorResponse) {
  //       resultCode = error.error?.resultCode || 'UNKNOWN_ERROR_CODE';
  //     } else if (error instanceof Error) {
  //       resultCode = error.message;
  //     }

  //     this.setErrorState(true, resultCode);

  //     if (resultCode === RESPONSE.UNAUTHORIZED || resultCode === RESPONSE.INVALID_ACCESS_TOKEN) {
  //       this.handleCommonExpired();
  //     }

  //     return { resultCode } as IBaseResponse<null>;
  //   }
  // }

  private handleCommonExpired() {
    this.modalCommonService.open({
      type: 'expire',
      title: 'EXPIRE_MODAL.TITLE',
      subtitle: 'EXPIRE_MODAL.SUBTITLE',
      buttonText: 'EXPIRE_MODAL.TEXT_BUTTON',
    });

    this.unsubscribeModal();

    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.authService.logout();
        this.router.navigate(['/login']);
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
}
