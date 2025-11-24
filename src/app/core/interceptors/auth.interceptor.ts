import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthenticationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getAccessToken()
    if (authToken && !req.url.includes('auth') || authToken && req.url.includes('revoke')) {
      const authReq = req.clone({
        setHeaders: {
          'x-authorization': `Bearer ${authToken}`
        }
      })
      return next.handle(authReq)
    } else {
      return next.handle(req)
    }
  }
}
