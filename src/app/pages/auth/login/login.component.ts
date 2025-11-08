import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { LoginService } from '../../../shared/services/login.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})

export class LoginComponent {
  form: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get username() {
    return this.form.get('username');
  }

  get password() {
    return this.form.get('password');
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
    try {
      const result = await this.loginService.login(this.form.value);
      console.log("Response login:", result);

      if (result.resultCode == RESPONSE.SUCCESS) {
        // const decoded = this.authService.decodeToken(result.data.accessToken);
        // this.authService.saveData(decoded.username, decoded.role);
      } else if (result.resultCode == RESPONSE.INVALID_CREDENTIALS) {
      }
      this.router.navigate(['/portal/landing']);
    } catch (error: any) {
      const errorObject = error as { message: string };
      if (errorObject.message !== '504') {
        // this.errorHandler.handleApiError(error);
      }
    }
    finally {
      this.isLoading = false;
    }
  }

}

