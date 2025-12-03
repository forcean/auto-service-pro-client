import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError, of, Subscription, NEVER, BehaviorSubject, from } from 'rxjs';
import { catchError, tap, switchMap, filter, take, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ModalCommonService } from '../../shared/components/modal-common/modal-common.service';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { LoginService } from '../../shared/services/login.service';
import { RESPONSE } from '../../shared/enum/response.enum';


@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  private errorCodeList: string[] = [
    RESPONSE.INTERNAL_SERVER_ERROR,
    RESPONSE.TOO_MANY_PARAMETERS,
    RESPONSE.GATE_WAY_TIMEOUT,
  ];

  private hasError = false;
  private modalSubscription: Subscription | null = null;

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private readonly EXPIRATION_THRESHOLD_SECONDS = 600;

  constructor(
    private router: Router,
    private modalCommonService: ModalCommonService,
    private authService: AuthenticationService,
    private loginService: LoginService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.hasError && (!req.url.includes('menu') || req.url.includes('not-found'))) {
      return of();
    }
    // ข้ามการตรวจสอบ token สำหรับ refresh token request
    if (req.url.includes('refresh')) {
      return next.handle(req);
    }
    return this.handleRequest(req, next);
  }

  private handleRequest(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ถ้าเป็น request สำหรับ i18n หรือ config ให้ผ่านไปเลย
    if (req.url.includes('i18n') || req.url.includes('config.json')) {
      return next.handle(req);
    }

    let accessToken = this.authService.getAccessToken();
    const refreshToken = this.authService.getRefreshToken();

    // ถ้าไม่มี token ใน localStorage
    if (!accessToken && !refreshToken) {
      return this.send(req, next);
    }

    // ตรวจสอบ token ก่อนส่ง request
    if (accessToken && refreshToken) {
      const decoded = this.decodeToken(accessToken);
      if (decoded?.exp) {
        const now = Math.floor(Date.now() / 1000);

        // ถ้า token หมดอายุแล้ว
        if (decoded.exp <= now) {
          // console.log('Token expired, clearing localStorage');
          this.authService.logout();
          return this.send(req, next);
        }

        const isExpiringSoon = decoded.exp - now <= this.EXPIRATION_THRESHOLD_SECONDS;

        // ถ้า token ใกล้หมดอายุ ให้ refresh ก่อนส่ง request
        if (isExpiringSoon && !this.isRefreshing) {
          // console.log('Token expiring soon, refreshing before request:', req.url);
          return this.handleRefreshToken(req, next);
        } else if (this.isRefreshing) {
          // console.log('Waiting for token refresh before request:', req.url);
          // กำลัง refresh อยู่ ให้รอ token ใหม่
          return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => this.send(this.addTokenToRequest(req, token), next))
          );
        }
      }
    }

    // เพิ่ม token ลงใน request ถ้ามี
    if (accessToken) {
      req = this.addTokenToRequest(req, accessToken);
    }

    return this.send(req, next);
  }


  private handleRefreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // ถ้ากำลัง refresh token อยู่แล้ว ให้รอจนกว่าจะเสร็จ
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => this.send(this.addTokenToRequest(req, token), next))
      );
    } else {
      // console.log('Starting token refresh process');
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const accessToken = this.authService.getAccessToken();
      const refreshToken = this.authService.getRefreshToken();

      if (!refreshToken) {
        // console.log('No refresh token found, redirecting to login');
        this.isRefreshing = false;
        this.handleCommonExpired();
        return NEVER;
      }

      // ทำการ refresh token
      return from(this.loginService.getRefreshToken({ accessToken: accessToken!, refreshToken })).pipe(
        switchMap((response) => {
          // Token ใหม่จะถูกตั้งค่าผ่าน Local โดย Response Headers (Set-Local-Storage)
          this.authService.login(response.resultData.accessToken, response.resultData.refreshToken);
          const newToken = this.authService.getAccessToken();
          this.refreshTokenSubject.next(newToken);

          // ส่ง request ใหม่พร้อม token ใหม่
          return this.send(this.addTokenToRequest(req, newToken!), next);
        }),
        catchError(error => {
          this.isRefreshing = false;
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    }
  }

  /** ส่ง request พร้อมตรวจ–ดัก error ในที่เดียว */
  private send(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => this.inspectResponse(event)),
      catchError(err => this.handleResponseError(err, req, next))
    );
  }

  /** ตรวจสอบผลลัพธ์ แล้วโยน error ตามเงื่อนไข */
  private inspectResponse(event: HttpEvent<any>): void {
    if (!(event instanceof HttpResponse)) return;

    const resultCode = event.body?.resultCode;
    if (
      event.status === 500 ||
      event.status === 502 ||
      this.errorCodeList.includes(resultCode) ||
      (event.status === 429 && resultCode === RESPONSE.TOO_MANY_REQUESTS)
    ) {
      this.hasError = true;
      this.handleCommonError();
      throw new HttpErrorResponse({
        error: { resultCode, developerMessage: 'Internal Server Error' },
        status: 500,
      });
    }

    if ([RESPONSE.INVALID_ACCESS_TOKEN, RESPONSE.UNAUTHORIZED].includes(resultCode)) {
      this.hasError = true;
      this.handleCommonExpired();
      throw new HttpErrorResponse({
        error: { resultCode, developerMessage: 'Unauthorized Access' },
        status: 401,
      });
    }
  }

  private handleResponseError(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const resultCode = error.error?.resultCode;
    const HttpStatusCode = error.status.toString();
    // ถ้าเป็น refresh-token และเจอ 500 — ไม่ต้องทำอะไรเลย
    if (error.status === 500 && req.url.includes('refresh')) {
      return of();
    }

    // กรณี Unauthorized
    if (error.status === 401 && [RESPONSE.INVALID_ACCESS_TOKEN, RESPONSE.UNAUTHORIZED].includes(resultCode)) {
      this.hasError = true;
      this.handleCommonExpired();
      return throwError(() => new Error(resultCode));
    } else if (error.status === 500 ||
      error.status === 502 ||
      this.errorCodeList.includes(resultCode) ||
      (error.status === 429 && resultCode === RESPONSE.TOO_MANY_REQUESTS)
    ) {
      this.hasError = true;
      this.handleCommonError();
      return throwError(() => new Error(resultCode));
    } else if (error.status === 504) {
      this.hasError = true;
      this.handleCommonError();
      return throwError(() => new Error(HttpStatusCode));
    } else {
      return throwError(() => error);
    }
  }

  private addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        'x-authorization': `Bearer ${token}`
      }
    });
  }

  private decodeToken(token: string): any {
    if (!token) {
      return null;
    }
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    try {
      return JSON.parse(atob(tokenParts[1]));
    } catch (e) {
      return null;
    }
  }

  private handleCommonExpired() {
    this.modalCommonService.open({
      type: 'expire',
      title: 'เซสชั่นหมดอายุ',
      subtitle: 'เซสชั่นของคุณหมดอายุเนื่องจากไม่มีการใช้งาน <br>กรุณาเข้าสู่ระบบอีกครั้งเพื่อดำเนินการต่อ',
      buttonText: 'เข้าสู่ระบบ'
    });

    this.unsubscribeModal();
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        this.hasError = false;
        this.unsubscribeModal();
      }
    });
  }

  private handleCommonError() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
    });

    this.unsubscribeModal();

    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.hasError = false;
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