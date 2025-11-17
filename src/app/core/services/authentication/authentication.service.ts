import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public readonly storageKey = 'userData';

  private readonly ACCESS_TOKEN_NAME = 'access-token';
  private readonly REFRESH_TOKEN_NAME = 'refresh-token';
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private cookieService: CookieService,
  ) {
    this.isAuthenticatedSubject.next(this.checkAuthenticationState());
  }

  // saveData(username: string, actor: string): void {
  //   const data = { username, actor };
  //   localStorage.setItem(this.storageKey, JSON.stringify(data));

  // }

  public login(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_NAME, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_NAME, refreshToken);
    this.isAuthenticatedSubject.next(true);
  }

  public logout(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_NAME);
    localStorage.removeItem(this.REFRESH_TOKEN_NAME);
    this.cookieService.delete(this.ACCESS_TOKEN_NAME, '/');
    this.cookieService.delete(this.REFRESH_TOKEN_NAME, '/');
    this.isAuthenticatedSubject.next(false);
  }

  private decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_NAME);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_NAME);
  }
  // getAccessToken(): string | null {
  //   return this.cookieService.get(this.ACCESS_TOKEN_NAME);
  // }

  // getRefreshToken(): string | null {
  //   return this.cookieService.get(this.REFRESH_TOKEN_NAME);
  // }

  checkAuthenticationState(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    // เช็ค token expiration
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.exp) {
        return false;
      }
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp <= now) {
        // ถ้า token หมดอายุให้ clear localStorage ด้วย
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }
}
