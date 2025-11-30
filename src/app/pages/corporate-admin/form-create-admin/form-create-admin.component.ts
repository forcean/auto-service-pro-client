import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { getInvalidControl, publicIdValidator } from '../../../shared/util';
import { IStrongPassword } from '../../../shared/interface/strong-password.interface';
import { StrongPasswordInputComponent } from '../../../shared/components/strong-password-input/strong-password-input.component';

@Component({
  selector: 'app-form-create-admin',
  standalone: false,
  templateUrl: './form-create-admin.component.html',
  styleUrl: './form-create-admin.component.scss'
})
export class FormCreateAdminComponent implements OnInit {
  private modalSubscription: Subscription | null = null;
  form!: FormGroup;
  managerList: any[] = [];
  mustSelectManager = false;
  isMatchEmail: boolean = false;
  isPasswordInvalid: boolean = false;
  isPasswordFormat: boolean = false;
  isStrong: boolean = false;
  isMobileNoInvalid: boolean = false;
  isPasswordVisible: boolean = false;

  getInvalidControl = getInvalidControl;

  @ViewChild('StrongPasswordInputComponent') strongPasswordInputComponent!: StrongPasswordInputComponent;


  constructor(
    private fb: FormBuilder,
    private modalCommonService: ModalCommonService,
    private router: Router,
  ) { }


  ngOnInit() {
    this.createForm();
    this.loadManagerList();
  }


  ngOnDestroy() {
    if (this.modalSubscription) this.modalSubscription.unsubscribe();
  }


  createForm() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z][a-zA-Z0-9._-]*$/), publicIdValidator()]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      role: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      managerId: ['']
    });
  }


  async loadManagerList() {
    try {
      // const result = await this.userService.getManagers();
      // this.managerList = result.data;
      this.managerList = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Smith' }
      ];
    } catch (err) {
      console.error('Error loading manager list', err);
    }
  }


  onPasswordComplete(event: IStrongPassword) {
    this.isStrong = event.isStrong;
    this.form.controls['password'].setValue(event.password);
    const confirm = this.form.controls['confirmPassword'].value;
    this.isPasswordInvalid = confirm && confirm !== event.password;
  }


  onRoleChange() {
    const role = this.form.get('role')?.value;
    if (['ACC', 'SAL', 'STC', 'MEC'].includes(role)) {
      this.mustSelectManager = true;
      this.form.get('managerId')?.setValidators([Validators.required]);
    } else {
      this.mustSelectManager = false;
      this.form.get('managerId')?.clearValidators();
      this.form.get('managerId')?.setValue('');
    }
    this.form.get('managerId')?.updateValueAndValidity();
  }


  validateEmail(event: Event) {
    const input = event.target as HTMLInputElement;
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isMatchEmail = !pattern.test(input.value);
  }


  checkMobileLength() {
    const value = this.form.controls['phoneNumber'].value || '';
    if (value.startsWith('0')) return 10;
    if (value.startsWith('66')) return 11;
    return 10;
  }


  checkMobileNoInvalid() {
    this.isMobileNoInvalid = this.form.controls['phoneNumber'].invalid && this.form.controls['phoneNumber'].touched;
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const pw = this.form.value.password;
      const cf = this.form.value.confirmPassword;
      this.isPasswordInvalid = pw !== cf;
      this.isPasswordInvalid = this.form.value.password !== this.form.value.confirmPassword;
      this.checkMobileNoInvalid();
      this.validateEmail({ target: { value: this.form.value.email } } as any);
      return;
    }

    console.log('Submit:', this.form.value);
  }

  private handleNotFoundProfile() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ADMIN_MANAGEMENT.TITLE_NOT_FOUND_PROFILE',
      subtitle: 'ADMIN_MANAGEMENT.SUBTITLE_NOT_FOUND_PROFILE',
      buttonText: 'GLOBAL.UNDERSTAND'
    });
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.unsubscribeModal();
      }
    });
  }

  private handleCommonSuccess() {
    this.modalCommonService.open({
      type: 'success',
      title: 'ADMIN_MANAGEMENT.MODAL_TITLE',
      subtitle: 'ADMIN_MANAGEMENT.MODAL_SUB_TITLE',
      buttonText: 'GLOBAL.CONFIRM'
    });
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/corporate-admin/account']);
        this.unsubscribeModal();
      }
    });
  }

  private handleCommonError() {
    this.modalSubscription = this.modalCommonService.isOpen.subscribe((obj) => {
      if (!obj?.isOpen) {
        this.router.navigate(['/portal/corporate-admin/account']);
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

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ERROR_MODAL.TITLE',
      subtitle: 'ERROR_MODAL.SUBTITLE',
      buttonText: 'ERROR_MODAL.TEXT_BUTTON',
    });
  }
}