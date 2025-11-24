import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { ModalCommonService } from '../../shared/components/modal-common/modal-common.service';
import { HandleTokenService } from '../services/handle-token-service/handle-token.service';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private callBackUrl: string = '';
  private modalSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private handleTokenService: HandleTokenService,
    private modalCommonService: ModalCommonService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return combineLatest([
      this.handleTokenService.handleTokenExpired().pipe(take(1)),
      this.authService.isLoggedIn(),
    ]).pipe(
      tap(([isExpire, isLoggedIn]) => {
        const path = ['/report-download', '/verify/email'].includes(state.url.split('?')[0]) ? state.url : state.url.split('?')[0];
        if (isExpire && isLoggedIn) {
          this.callBackUrl = path;
          this.handleCommonExpired();
        } else if (isExpire && !isLoggedIn) {
          this.callBackUrl = path;
          this.handleUnauthenticated();
        }
      }),
      map(([isExpire, isLoggedIn]) => !isExpire && isLoggedIn),
      catchError(() => {
        this.handleUnauthenticated();
        return of(false);
      }),
    );
  }

  private handleUnauthenticated(): Observable<boolean> {
    const params = {
      callBackUrl: this.callBackUrl
    };
    this.router.navigate(['/auth/login'], { queryParams: params });
    return of(false);
  }

  private handleCommonExpired() {
    this.modalCommonService.open({
      type: 'expire',
      title: 'เซสชั่นหมดอายุ',
      subtitle: 'เซสชั่นของคุณหมดอายุเนื่องจากไม่มีการใช้งาน <br>กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ',
      buttonText: 'เข้าสู่ระบบ'
    });

    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        const params = {
          callBackUrl: this.callBackUrl
        };
        this.router.navigate(['/auth/login'], { queryParams: params });
        this.authService.logout();
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
