import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, merge, fromEvent, throttleTime, interval, from } from "rxjs";
import { LoginService } from "./login.service";
import { AuthenticationService } from "../../core/services/authentication/authentication.service";
import { ModalCommonService } from "../components/modal-common/modal-common.service";

@Injectable({ providedIn: 'root' })
export class IdleSessionService implements OnDestroy {

  private readonly IDLE_CHECK_INTERVAL = 60;   // ตรวจทุก 60 วินาที
  private readonly EXPIRATION_THRESHOLD_SECONDS = 120;  // เหลือ <120s ให้ refresh

  /** เวลาสุดท้ายที่มี activity (หน่วย : วินาที) */
  private lastActivity = Math.floor(Date.now() / 1000);
  private hasActivity = false;
  private isRefreshing = false;
  private checkSub!: Subscription;
  private modalSubscription: Subscription | null = null;


  constructor(
    private authService: AuthenticationService,
    private loginService: LoginService,
    private modalCommonService: ModalCommonService,
    private router: Router
  ) { }

  start() {
    // console.log('[IdleSession] Service started');
    /* 1. จับ activity ทุกหน้า */
    merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll')
    )
      .pipe(throttleTime(1000))
      .subscribe(() => {
        this.lastActivity = Math.floor(Date.now() / 1000);
        this.hasActivity = true;
        console.log(' User activity detected', new Date().toLocaleTimeString());
      });

    /* 2. ตั้ง interval ตามค่า (วินาที) จาก env */
    const intervalMs = this.IDLE_CHECK_INTERVAL * 1000;
    this.checkSub = interval(intervalMs).subscribe(() => this.check());
  }

  private check() {
    const now = Math.floor(Date.now() / 1000);
    console.log('[IdleSession] Check @', new Date(now * 1000).toLocaleTimeString());

    // ถ้าอยู่ที่หน้า /login ไม่ต้องตรวจสอบ
    if (this.router.url.startsWith('/auth/login')) {
      console.log('skip check login page');

      return;
    }
    console.log('before get accessToken');

    const accessToken = this.authService.getAccessToken();
    console.log('after get accessToken');
    if (!accessToken) {
      console.log('have not token');

      if (!this.isRefreshing) {
        console.log('session expired');
        this.sessionExpired();
      }
      return;
    }
    const decoded: any = this.decodeToken(accessToken);
    if (!decoded?.exp) return;
    /* a) token หมดอายุแล้ว */
    if (decoded.exp <= now) {
      this.sessionExpired();
      return;
    }
    /* b) ใกล้หมด (< EXPIRATION_THRESHOLD_SECONDS) + มี activity + ยังไม่กำลัง refresh */
    const expirationThreshold = this.EXPIRATION_THRESHOLD_SECONDS;
    if (
      decoded.exp - now <= expirationThreshold &&
      this.hasActivity &&
      !this.isRefreshing
    ) {
      this.refreshToken();
    }
  }

  private refreshToken() {
    console.log('[IdleSession] Refreshing token …');
    this.isRefreshing = true;
    const payload = {
      accessToken: this.authService.getAccessToken()!,
      refreshToken: this.authService.getRefreshToken()!
    };
    from(this.loginService.getRefreshToken(payload)).subscribe({
      next: (res) => {
        // console.log('[IdleSession] Token refresh success');
        /* เส้น refreshToken ตั้ง cookie → authService.read() */
        this.authService.login(res.resultData.accessToken, res.resultData.refreshToken);
        this.hasActivity = false;
        this.isRefreshing = false;
      },
      error: () => {
        // console.error('[IdleSession] Token refresh failed');
        this.isRefreshing = false;
        this.sessionExpired();
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

  private sessionExpired() {
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
        this.router.navigate(['/login']);
        this.unsubscribeModal();
      }
    });
  }

  ngOnDestroy() {
    this.checkSub?.unsubscribe();
    this.unsubscribeModal();
  }

  private unsubscribeModal() {
    if (this.modalSubscription) {
      this.modalSubscription.unsubscribe();
      this.modalSubscription = null;
    }
  }
}