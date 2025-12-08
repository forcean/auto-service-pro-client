import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { IOptionModalCommon } from '../modal-common/modal-common.service';
import { ResetPasswordModuleService } from './reset-password-modal.service';
import { IStrongPassword } from '../../interface/strong-password.interface';
import { StrongPasswordInputComponent } from '../strong-password-input/strong-password-input.component';

@Component({
  selector: 'app-reset-password-modal',
  standalone: false,
  templateUrl: './reset-password-modal.component.html',
  styleUrl: './reset-password-modal.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ResetPasswordModuleComponent implements OnInit {
  @Output() newPassword: EventEmitter<any> = new EventEmitter();
  @Input() isPasswordInvalid: boolean = false;
  @Input() isPasswordDuplicate: boolean = false;

  passwordForm: FormGroup
  isNewPassword: boolean = false
  passwordVisibleConfirm: boolean = false

  @ViewChild('pwdInputConfirm') passwordInputConfirm!: ElementRef;
  @ViewChild('StrongPasswordInputComponent') strongPasswordInputComponent!: StrongPasswordInputComponent;

  optionModal!: IOptionModalCommon

  constructor(
    private fb: FormBuilder,
    private modalResetService: ResetPasswordModuleService,
    private cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.modalResetService.isOpen.subscribe(t => this.optionModal = t)
  }

  togglePasswordVisibilityConfirm() {
    this.passwordVisibleConfirm = !this.passwordVisibleConfirm;
    if (this.passwordInputConfirm.nativeElement.type === 'password') {
      this.passwordInputConfirm.nativeElement.type = 'text'
    } else {
      this.passwordInputConfirm.nativeElement.type = 'password'
    }
  }

  closeModal(): void {
    this.passwordForm.controls['newPassword'].patchValue('');
    this.passwordForm.controls['confirmPassword'].patchValue('');
    this.passwordVisibleConfirm = false;
    this.isPasswordInvalid = false;
    this.isPasswordDuplicate = false;
    this.modalResetService.close(this.optionModal)
  }

  checkData(event: IStrongPassword) {
    this.isNewPassword = event.isStrong
    if (this.passwordForm.value.newPassword !== event.password) {
      this.isPasswordInvalid = false;

      this.strongPasswordInputComponent.resetIsError();
      this.passwordForm.controls['newPassword'].patchValue(event.password);
      this.cdr.detectChanges();
    }
  }

  onConfirm() {
    this.newPassword.emit(this.passwordForm.get('confirmPassword')?.value)
  }

  generatePassword(): void {
    const generatePassword = this.generateStrongPassword();

    this.passwordForm.controls['newPassword'].setValue(generatePassword);
    this.passwordForm.controls['confirmPassword'].setValue(generatePassword);

    this.strongPasswordInputComponent.updatePassword(generatePassword);

    this.isPasswordInvalid = false;

    this.isNewPassword = true;
    this.cdr.detectChanges();
  }

  private generateStrongPassword(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const specials = '@#';
    const all = upper + lower + digits + specials;

    let password = '';
    password += this.getRandomChar(upper);
    password += this.getRandomChar(lower);
    password += this.getRandomChar(digits);
    password += this.getRandomChar(specials);

    for (let i = password.length; i < 12; i++) {
      password += this.getRandomChar(all);
    }

    return this.shuffleString(password);
  }

  private shuffleString(str: string): string {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.getSecureRandomInt(0, i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  private getSecureRandomInt(min: number, max: number): number {
    const range = max - min;
    if (range <= 0) {
      throw new Error('Invalid range for random int');
    }

    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    return min + (randomBuffer[0] % range);
  }

  private getRandomChar(charset: string): string {
    return charset[this.getSecureRandomInt(0, charset.length)];
  }

}
