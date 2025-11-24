import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { LoginService } from '../../../shared/services/login.service';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { AuthenticationService } from '../../../core/services/authentication/authentication.service';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent {
  private modalSubscription: Subscription | null = null;
  form: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private modalCommonService: ModalCommonService,
    private authenticationService: AuthenticationService,
    private loadingBarService: LoadingBarService,
  ) {
    this.form = this.fb.group({
      publicId: ['', [Validators.required]],
      painTextPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    { }
  }

  get publicId() {
    return this.form.get('publicId');
  }

  get painTextPassword() {
    return this.form.get('painTextPassword');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const loader = this.loadingBarService.useRef();
    loader.start();
    try {
      const result = await this.loginService.login(this.form.value);
      console.log("Response login:", result);

      if (result.resultCode == RESPONSE.SUCCESS) {
        this.authenticationService.login(result.resultData.accessToken, result.resultData.refreshToken);
        this.router.navigate(['/portal/landing']);
      } else if (result.resultCode == RESPONSE.INVALID_ACCESS_TOKEN) {
        this.handleFailResponse();
      }
      else {
        this.handleFailResponse();
      }
    } catch (error: any) {
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        this.handleCommonError();
      }
    }
    finally {
      this.isLoading = false;
      loader.complete();
    }
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/auth/login']);
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

  private handleFailResponse(path?: string) {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      subtitle: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
      buttonText: 'เข้าใจแล้ว',
      routePage: path,
    });
  }

}

