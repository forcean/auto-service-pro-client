import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core'; import { Router } from '@angular/router';
import { HandleTokenService } from '../../../core/services/handle-token-service/handle-token.service';
import { ModalCommonService } from '../modal-common/modal-common.service';
// import { HandleEmailService } from '@shared/services/handle-email.service';
import { HandleCookieService } from '../../../core/services/handle-cookie-service/handle-cookie.service';
import { LoginService } from '../../services/login.service';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
import { RESPONSE } from '../../enum/response.enum';
@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, AfterViewInit {
  username = '';
  isNotEmailVerified = false;
  isDropdownOpen = false;

  @ViewChild('dropdownMenu') dropdownMenuRef!: ElementRef;
  @ViewChild('arrowDown') arrowDownRef!: ElementRef;
  @ViewChild('arrowUp') arrowUpRef!: ElementRef;

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private handleTokenService: HandleTokenService,
    private loginService: LoginService,
    private modalCommonService: ModalCommonService,
    // private handleEmailService: HandleEmailService,
    private handleCookieService: HandleCookieService
  ) {
    this.username = this.handleTokenService.getUsername();
    // this.handleEmailService.isNotEmailVerified().subscribe((isNotEmailVerified) => {
    //   this.isNotEmailVerified = isNotEmailVerified;
    // });
  }

  ngOnInit(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.isNotEmailVerified = !!this.handleCookieService.getCookie('esd');
      }
    });
  }

  ngAfterViewInit(): void {
    this.closeDropdown();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    const menu = this.dropdownMenuRef.nativeElement as HTMLElement;
    const arrowDown = this.arrowDownRef.nativeElement as HTMLElement;
    const arrowUp = this.arrowUpRef.nativeElement as HTMLElement;

    if (this.isDropdownOpen) {
      menu.classList.remove('hidden');
      setTimeout(() => menu.classList.add('show'), 10);
      arrowDown.classList.add('hidden');
      arrowUp.classList.remove('hidden');
    } else {
      this.closeDropdown();
    }
  }

  private closeDropdown(): void {
    this.isDropdownOpen = false;
    const menu = this.dropdownMenuRef?.nativeElement as HTMLElement;
    const arrowDown = this.arrowDownRef?.nativeElement as HTMLElement;
    const arrowUp = this.arrowUpRef?.nativeElement as HTMLElement;
    if (menu) {
      menu.classList.remove('show');
      setTimeout(() => menu.classList.add('hidden'), 150);
    }
    arrowDown?.classList.remove('hidden');
    arrowUp?.classList.add('hidden');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const menu = this.dropdownMenuRef?.nativeElement;
    const target = event.target as HTMLElement;

    if (menu && !menu.contains(target) && !target.closest('#dropdownProfile')) {
      this.closeDropdown();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.closeDropdown();
  }

  onProfileDetail() {
    this.closeDropdown();
    this.router.navigate(['/portal/user/profile']);
  }

  onLogout() {
    this.closeDropdown();
    this.handleCookieService.clear('esd');
    this.handleLogout();
  }

  onContactUs() {
    this.closeDropdown();
    this.handleContactUs();
  }

  async handleLogout() {
    try {
      const response = await this.loginService.logout();
      if (response.resultCode === RESPONSE.SUCCESS) {
        this.authenticationService.logout();
        this.router.navigate(['/']);
      } else if (response.resultCode === RESPONSE.INVALID_CREDENTIALS) {
        this.handleCommonExpired();
        this.authenticationService.logout();
      } else {
        this.handleCommonError();
        this.authenticationService.logout();
      }
    } catch (error) {
      console.error(error);
      this.authenticationService.logout();
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        this.router.navigate(['/']);
      }
    }
  }

  private handleCommonExpired() {
    this.modalCommonService.open({
      type: 'expire',
      title: 'EXPIRE_MODAL.TITLE',
      subtitle: 'EXPIRE_MODAL.SUBTITLE',
      buttonText: 'EXPIRE_MODAL.TEXT_BUTTON',
      routePage: '/login',
    });
  }

  private handleCommonError() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ERROR_MODAL.TITLE',
      subtitle: 'ERROR_MODAL.SUBTITLE',
      buttonText: 'ERROR_MODAL.TEXT_BUTTON',
      routePage: '/login',
    });
  }

  private handleContactUs() {
    this.modalCommonService.open({
      type: undefined,
      title: 'CONTACT_US_MODAL.TITLE',
      subtitle: 'CONTACT_US_MODAL.SUBTITLE',
      buttonText: 'CONTACT_US_MODAL.TEXT_BUTTON',
      height: '12rem',
    });
  }
}