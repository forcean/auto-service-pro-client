import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class HandleTokenService {

  constructor(private authenticationService: AuthenticationService) { }

  private decodeToken(token: string | null): any {
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

  private getDecodedAccessToken() {
    const token = this.authenticationService.getAccessToken();
    return this.decodeToken(token);
  }

  getRole(): string {
    const decodedToken = this.getDecodedAccessToken();
    return decodedToken && decodedToken.role;
  }

  getUsername(): string {
    const decodedToken = this.getDecodedAccessToken();
    return decodedToken && decodedToken.publicId;
  }

  // getSysMail(): string {
  //   const decodedToken = this.getDecodedAccessToken();
  //   return decodedToken && decodedToken.sysEmail;
  // }

  // getUserId(): string {
  //   const decodedToken = this.getDecodedAccessToken();
  //   return decodedToken && decodedToken.aud;
  // }

  // getChargeNumber(): string {
  //   const decodedToken = this.getDecodedAccessToken();
  //   return decodedToken && decodedToken.chargeNumber;
  // }

  handleTokenExpired(): Observable<boolean> {
    const token = this.authenticationService.getAccessToken();
    if (!token) {
      return of(true);
    }
    const decodedToken = this.decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
      return of(true);
    }
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);
    return of(expirationDate < new Date());
  }

}
