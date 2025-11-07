import { CookieService } from 'ngx-cookie-service';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HandleCookieService {

  constructor(private cookieService: CookieService) { }

  setCookie(key: string, value: string | object, expires?: number | Date): void {
    if (typeof value === 'object') {
      value = btoa(JSON.stringify(value));
    } else {
      value = btoa(value);
    }
    this.cookieService.set(key, value, { expires, path: '/', sameSite: 'None', secure: true });
  }

  getCookie(key: string): string | object | null {
    const cookieValue = this.cookieService.get(key);

    if (!cookieValue) return null;

    try {
      const decodedValue = atob(cookieValue);
      return JSON.parse(decodedValue);
    } catch (e) {
      return atob(cookieValue);
    }
  }

  getCookie$(key: string): Observable<string | object | null> {
    const cookieValue = this.getCookie(key);
    return of(cookieValue);
  }


  clear(name: string): void {
    this.cookieService.delete(name, '/');
  }
}
