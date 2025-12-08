import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation, OnDestroy, AfterViewInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IStrongPassword } from '../../interface/strong-password.interface';

declare const bootstrap: any;

@Component({
  selector: 'app-strong-password-input',
  standalone: false,
  templateUrl: './strong-password-input.component.html',
  styleUrls: ['./strong-password-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StrongPasswordInputComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {

  @Input() position: 'left' | 'right' | 'auto' = 'auto';
  @Input() isError = false;
  @Input() isPasswordExist = false;

  @Output() onCompletePassword = new EventEmitter<IStrongPassword>();

  @ViewChild('passwordInput') passwordInput!: ElementRef;
  @ViewChild('passwordPopover', { static: true }) passwordPopover!: ElementRef;

  passwordForm: FormGroup;
  isPasswordVisible = false;
  isPasswordEnable = false;
  message = '';
  messageColor = '';
  passwordStrengthLevelText: string = 'ความปลอดภัยของรหัสผ่าน';

  barColors = ['', '', '', ''];
  popoverInstance: any;
  popoverContent = '';

  private readonly colors = ['#F5222D', '#FFC107', '#7BA800', '#A88D00'];

  constructor(
    private fb: FormBuilder,
  ) {
    this.passwordForm = this.fb.group({
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
  }

  ngAfterViewInit(): void {
    const inputEl = this.passwordInput.nativeElement;

    this.popoverInstance = new bootstrap.Popover(inputEl, {
      html: true,
      sanitize: false,
      content: () => this.passwordPopover.nativeElement.innerHTML,
      customClass: 'custom-popover',
      trigger: 'manual',
      container: 'body',     // <<< FIX ใหญ่ที่สุด
      placement: 'right-start'
    });

    inputEl.addEventListener('focus', () => this.showPopover());
    inputEl.addEventListener('blur', () => this.hidePopover());
  }

  isPopoverVisible = false;

  showTailwindPopover() {
    this.isPopoverVisible = true;
  }

  hideTailwindPopover() {
    // delay เพื่อกัน blur ตอนกด toggle eye
    setTimeout(() => {
      if (!this.isPasswordVisible) {
        this.isPopoverVisible = false;
      }
    }, 150);
  }
  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  ngDoCheck(): void {
    this.updatePasswordStrength();
  }

  private showPopover(): void {
    this.popoverInstance.show();
  }

  private hidePopover(): void {
    this.popoverInstance.hide();
  }

  resetForm() {
    this.passwordForm?.reset();
    this.isPasswordVisible = false;
  }

  resetIsError() {
    this.isError = false;
  }

  disableForm() {
    this.passwordForm?.disable();
  }

  enableForm() {
    this.passwordForm?.enable();
  }

  updatePassword(password: string): void {
    this.passwordForm.controls['password'].setValue(password);
    this.updatePasswordStrength();
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  checkPasswordStrength(event: KeyboardEvent): boolean {
    const isAllowedKey = /^[A-Za-z0-9@#]*$/.test(event.key) || event.key === 'Backspace';
    return event.ctrlKey || isAllowedKey;
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text/plain') || '';
    if (/^[A-Za-z0-9@#]*$/.test(pastedText)) {
      this.passwordForm.controls['password'].patchValue(pastedText);
    }
  }

  private onDocumentClick(event: Event): void {
    if (this.passwordInput && this.passwordInput.nativeElement.contains(event.target)) {
      return;
    }
    this.hidePopover();
  }

  private updatePasswordStrength(): void {
    const password = this.passwordForm.get('password')?.value || '';
    const strengthData = this.calculateStrength(password);
    this.setBarColors(strengthData.strength);
    this.emitPasswordComplete(strengthData);
    this.isPasswordEnable = strengthData.isEnable;
    this.updatePasswordStrengthText(strengthData.strength);
  }

  private calculateStrength(password: string): { strength: number; isEnable: boolean } {
    const minLength = 12;
    let strength = 0;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[@#]/.test(password);

    if (password.length >= minLength) { strength += 25; }
    else if (password.length >= 8) { strength += 15; }
    if (hasUpperCase) { strength += 15; }
    if (hasLowerCase) { strength += 15; }
    if (hasNumeric) { strength += 15; }
    if (hasSpecialChar) { strength += 15; }

    if (strength > 0) {
      if (strength < 25) {
        strength = 25;
      }
      if (strength >= 45 && password.length >= 5 && strength < 60) {
        strength = 50
      }
      if (strength >= 60 && password.length >= 8 && strength < 75) {
        strength = 75
      }
      if (strength >= 85) {
        strength = 100
      }
    }

    const isEnable = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar
    return { strength, isEnable };
  }

  private setBarColors(strength: number): void {
    const index = strength === 100 ? 3 : Math.floor(strength / 25) - 1;
    this.messageColor = this.colors[index];
    this.barColors = Array(4).fill('#DDD').fill(this.colors[index], 0, index + 1);
  }

  private emitPasswordComplete(strengthData: { strength: number; isEnable: boolean }): void {
    this.onCompletePassword.emit({
      isStrong: strengthData.isEnable,
      password: this.passwordForm.get('password')?.value,
    });
  }

  get passwordStrength(): { strength: number; isEnable: boolean } {
    return this.calculateStrength(this.passwordForm.get('password')?.value || '');
  }

  private updatePasswordStrengthText(strength: number): void {
    if (strength === 100) {
      this.passwordStrengthLevelText = 'แข็งแรง';
    } else if (strength >= 75) {
      this.passwordStrengthLevelText = 'ปานกลาง';
    } else if (strength >= 50) {
      this.passwordStrengthLevelText = 'อ่อน';
    } else if (strength > 0) {
      this.passwordStrengthLevelText = 'อ่อนมาก';
    } else {
      this.passwordStrengthLevelText = 'ความปลอดภัยของรหัสผ่าน';
    }
  }

  check(): string {
    return this.position === 'left' ? 'left' : 'right';
  }
}
