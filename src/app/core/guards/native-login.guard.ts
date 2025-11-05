import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HandleTokenService } from '../services/handle-token-service/handle-token.service';
import { AuthenticationService } from '../services/authentication/authentication.service';

@Injectable({ providedIn: 'root' })
export class NativeLoginGuard {
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private handleTokenService: HandleTokenService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      switchMap(isLogged => {
        return this.handleTokenService.handleTokenExpired().pipe(
          map(isExpired => {
            if (isLogged && !isExpired) {
              this.router.navigate(['/portal/landing']);
              return false;
            } else {
              return true;
            }
          }),
        );
      }),
    );
  }
}
