import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserManagementService } from '../../../shared/services/user-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { IReqUpdateUser } from '../../../shared/interface/user-management.interface';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-form-detail-user',
  standalone: false,
  templateUrl: './form-detail-user.component.html',
  styleUrl: './form-detail-user.component.scss'
})
export class FormDetailUserComponent implements OnInit {

  private modalSubscription: Subscription | null = null;
  form!: FormGroup;
  userData: any = null;
  isEditMode = false;
  managerList: any[] = [];
  mustSelectManager = false;

  isLoadingDelete: boolean = false;
  isPasswordInvalid: boolean = false;
  isLoadingEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalCommonService: ModalCommonService,
    private userManagementService: UserManagementService,
    private modalConditionService: ModalConditionService
  ) { }

  // @ViewChild(ResetPasswordModuleComponent) resetPasswordModuleComponent!: ResetPasswordModuleComponent;
  @ViewChild(ModalConditionComponent) modalConditionComponent!: ModalConditionComponent;

  ngOnInit(): void {
    const nav = history.state;
    this.userData = nav.user;

    // if (!this.userData) {
    //   this.router.navigate(['/portal/corporate-admin/account']);
    //   return;
    // }

    this.createForm();
    this.loadManagerList();
  }

  createForm() {
    this.form = this.fb.group({
      username: [{ value: this.userData.username, disabled: true }],
      name: [{ value: this.userData.firstname, disabled: true }, Validators.required],
      surname: [{ value: this.userData.lastname, disabled: true }, Validators.required],
      email: [{ value: this.userData.email, disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: [{ value: this.userData.phoneNumber, disabled: true }, Validators.required],
      role: [{ value: this.userData.role, disabled: true }, Validators.required],
      managerId: [{ value: this.userData.managerId || '', disabled: true }]
    });

    this.onRoleChange();
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

  loadManagerList() {
    this.managerList = [
      { id: 1, firstname: 'John', lastname: 'Doe' },
      { id: 2, firstname: 'Jane', lastname: 'Smith' }
    ];
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.form.enable();
      this.form.get('username')?.disable();
    } else {
      this.form.disable();
      this.form.get('username')?.disable();
    }
  }

  onCancelEdit() {
    this.isEditMode = false;
    this.form.reset({
      username: this.userData.username,
      name: this.userData.firstname,
      surname: this.userData.lastname,
      email: this.userData.email,
      phoneNumber: this.userData.phoneNumber,
      role: this.userData.role,
      managerId: this.userData.managerId || ''
    });
    this.form.disable();
    this.form.get('username')?.disable();
    this.onRoleChange();
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoadingEdit = true;
    try {
      const payload: IReqUpdateUser = {
        publicId: this.userData.id,
        firstName: this.form.value.name,
        lastName: this.form.value.surname,
        sysEmail: this.form.value.email,
        phoneNumber: this.form.value.phoneNumber,
        role: this.form.value.role,
        managerId: this.form.value.managerId || null
      };

      const res = await this.userManagementService.updateUserDetail(payload, this.userData.id);

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.userData = { ...this.userData, ...payload };
        this.onCancelEdit();
        this.handleSuccessEdit();
      } else if (res.resultCode === RESPONSE.INVALID_ACCESS_TOKEN) {
        this.handleFailEdit();
      } else {
        this.handleFailResponse();
      }
    } catch (error) {
      console.error('Response error', error);
      this.handleCommonError();
    } finally {
      this.isLoadingEdit = false;
    }
  }

  async deleteUser(id: string) {
    this.isLoadingDelete = true;
    try {
      const res = await this.userManagementService.deleteUser(id);

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleSuccessDelete();
      } else {
        this.handleFailDelete();
      }
      //  else if (res.resultCode === RESPONSE.INVALID_ACCESS_TOKEN) {
      //   // if (res.error?.code === ERR_CODE.EXISTING_PASSWORD) {
      //   //   this.resetPasswordModuleComponent.isPasswordDuplicate = true;
      //   // } else if (res.error?.code === ERR_CODE.INVALID_PASSWORD) {
      //   //   this.resetPasswordModuleComponent.isPasswordInvalid = true;
      //   // } else if (res.error?.code === ERR_CODE.ACCOUNT_INACTIVE) {
      //   //   this.closeModal();
      //   //   // this.handleFailAccountUnavailable();
      //   // }
      // } else if (res.resultCode === RESPONSE.INVALID_ACCESS_TOKEN) {
      //   this.closeModal();
      //   this.router.navigate(['/not-found']);
      // } else {
      //   this.closeModal();
      //   this.handleFailResetPassword();
      // }

    } catch (error) {
      console.error('Response error', error);
      this.handleCommonError();
    } finally {
      this.isLoadingDelete = false;
      this.modalConditionComponent.onClose();
    }
  }

  onDelete() {
    // this.userId = event;
    this.handleModalDelete();
  }

  handleOnModalConfirm(flag: string) {
    if (flag === 'change') {
      this.deleteUser(this.userData.id);
    }
  }

  private handleModalDelete() {
    this.modalConditionService.open({
      type: 'change',
      title: 'คุณต้องการลบผู้ใช้นี้หรือไม่?',
      subtitle: 'หากคุณยืนยัน ระบบจะทำการลบผู้ใช้นี้ออกจากระบบ และไม่สามารถกู้คืนได้ คลิก "ยืนยัน" เพื่อดำเนินการต่อ หรือคลิก "ยกเลิก" เพื่อออกจากหน้าต่างนี้.',
    });
  }

  private handleFailDelete() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ไม่สามารถลบผู้ใช้ได้',
      subtitle: 'ไม่สามารถลบผู้ใช้ได้ โปรดลองอีกครั้งหรือติดต่อ<br>ผู้ดูแลระบบหากปัญหายังคงอยู่',
      buttonText: 'ยืนยัน',
    });
  }

  private handleSuccessDelete() {
    this.modalCommonService.open({
      type: 'success',
      title: 'ลบผู้ใช้สำเร็จ',
      subtitle: 'ผู้ใช้นี้ถูกลบออกจากระบบเรียบร้อยแล้ว.',
      buttonText: 'เข้าใจแล้ว',
    });
  }
  private handleSuccessEdit() {
    this.modalCommonService.open({
      type: 'success',
      title: 'แก้ไขสำเร็จ',
      subtitle: 'แก้ไขข้อมูลผู้ใช้เเรียบร้อยแล้ว.',
      buttonText: 'เข้าใจแล้ว',
    });
  }

  private handleFailEdit() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ไม่สามารถแก้ไขข้อมูลได้',
      subtitle: 'ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้ โปรดลองอีกครั้งหรือติดต่อ<br>ผู้ดูแลระบบหากปัญหายังคงอยู่',
      buttonText: 'ยืนยัน',
    });
  }

  private handleFailResponse() {
    this.modalCommonService.open({
      type: 'alert',
      title: 'ขออภัย ระบบขัดข้องในขณะนี้',
      subtitle: 'กรุณาทำรายการใหม่อีกครั้ง หรือ ติดต่อผู้ดูแลระบบในองค์กรของคุณ',
      buttonText: 'เข้าใจแล้ว',
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
}
