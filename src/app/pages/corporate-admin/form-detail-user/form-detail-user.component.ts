import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalCommonService } from '../../../shared/components/modal-common/modal-common.service';
import { UserManagementService } from '../../../shared/services/user-management.service';
import { RESPONSE } from '../../../shared/enum/response.enum';
import { ModalConditionComponent } from '../../../shared/components/modal-condition/modal-condition.component';
import { ModalConditionService } from '../../../shared/components/modal-condition/modal-condition.service';
import { IReqUpdateUser, IResponseUserDetail } from '../../../shared/interface/user-management.interface';
import { Subscription } from 'rxjs';
import { UserList } from '../../../shared/interface/table-user-management.interface';


@Component({
  selector: 'app-form-detail-user',
  standalone: false,
  templateUrl: './form-detail-user.component.html',
  styleUrl: './form-detail-user.component.scss'
})
export class FormDetailUserComponent implements OnInit {

  private modalSubscription: Subscription | null = null;
  form!: FormGroup;
  userData!: IResponseUserDetail;
  managerList: UserList[] = [];
  managerName: string | null = null;
  page = 1;
  limit = 10;
  readonly role = 'MNG'

  mustSelectManager = false;
  isEditMode = false;
  isLoadingDelete: boolean = false;
  isPasswordInvalid: boolean = false;
  isLoadingEdit: boolean = false;
  isMobileNoInvalid: boolean = false;
  isMatchEmail: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private modalCommonService: ModalCommonService,
    private route: ActivatedRoute,
    private userManagementService: UserManagementService,
    private modalConditionService: ModalConditionService
  ) { }

  @ViewChild(ModalConditionComponent) modalConditionComponent!: ModalConditionComponent;

  async ngOnInit() {
    await this.getUserData();
    await this.loadManagerList();
    this.mapManagerName();
  }

  //  private async initializePermissions() {
  //   try {
  //     this.permissions = await this.permissionService.permissions();
  //     this.isViewAdminSender = this.permissionService.isViewAdminSender;
  //     this.isDeleteAdminSender = this.permissionService.isDeleteAdminSender;

  //     if (!this.isViewAdminSender) {
  //       this.router.navigate(['/not-found']);
  //     }

  //   } catch (error) {
  //     const errorObject = error as { message: string };
  //     if (errorObject.message !== '504') {
  //       this.handleCommonError();
  //     }
  //   }
  // }

  private async getUserData() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.router.navigate(['/portal/corporate-admin/account']);
      return;
    }
    // this.userData = {
    //   id: userId,
    //   publicId: 'user123',
    //   firstName: 'สมชาย',
    //   lastName: 'ใจดี',
    //   email: 'example@example.com',
    //   role: 'MEC',
    //   phoneNumber: '0812345678',
    //   managerId: '2',
    //   createdDt: '2023-01-01T12:00:00Z',
    //   createdBy: 'admin',
    //   updatedDt: '2023-06-01T12:00:00Z',
    //   updatedBy: 'admin2',
    //   activeFlag: true
    // };
    // this.createForm();
    try {
      const res = await this.userManagementService.getUserDetail(userId);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.userData = res.resultData;
        this.createForm();
      } else {
        this.createForm();
        this.handleCommonError();
      }
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  }

  createForm() {
    this.form = this.fb.group({
      username: [{ value: this.userData.publicId, disabled: true }],
      name: [{ value: this.userData.firstName, disabled: true }, Validators.required],
      surname: [{ value: this.userData.lastName, disabled: true }, Validators.required],
      email: [{ value: this.userData.email, disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: [{ value: this.userData.phoneNumber, disabled: true }, Validators.required],
      role: [{ value: this.userData.role, disabled: true }, Validators.required],
      managerId: [{ value: this.userData.managerId || '', disabled: true }],

      createdDt: [{ value: this.userData.createdDt, disabled: true }],
      createdBy: [{ value: this.userData.createdBy, disabled: true }],
      updatedDt: [{ value: this.userData.updatedDt, disabled: true }],
      updatedBy: [{ value: this.userData.updatedBy, disabled: true }],
      activeFlag: [{ value: this.userData.activeFlag, disabled: true }]
    });
    this.onRoleChange();
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

  validateEmail(event: Event) {
    const input = event.target as HTMLInputElement;
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.isMatchEmail = !pattern.test(input.value);
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
      this.form.get('managerId')?.markAsUntouched();
    }
    this.form.get('managerId')?.updateValueAndValidity();
  }

  private async loadManagerList() {
    try {
      const payload = {
        page: this.page,
        limit: this.limit,
        role: this.role
      };
      const res = await this.userManagementService.getListUser(payload);
      if (res.resultCode == RESPONSE.SUCCESS) {
        this.managerList = res.resultData?.users || [];
      } else {
        this.handleCommonError();
      }
      // this.managerList = [
      //   { id: '1', publicId: 'manager1', firstName: 'สมชาย', lastName: 'ใจดี', role: 'MNG', managerName: null, phoneNumber: '0812345678', activeFlag: true, lastAccess: null },
      //   { id: '2', publicId: 'manager2', firstName: 'สมหญิง', lastName: 'แสนสวย', role: 'MNG', managerName: null, phoneNumber: '0898765432', activeFlag: true, lastAccess: null },
      //   { id: '3', publicId: 'manager3', firstName: 'สมปอง', lastName: 'หัวไว', role: 'MNG', managerName: null, phoneNumber: '0823456789', activeFlag: false, lastAccess: null }
      // ];
    } catch (err) {
      console.error('Error loading manager list', err);
      this.handleCommonError();
    }
  }

  private mapManagerName() {
    if (!this.userData?.managerId) {
      this.managerName = '-';
      return;
    }

    const manager = this.managerList.find(
      m => m.id === this.userData.managerId
    );

    this.managerName = manager
      ? `${manager.firstName} ${manager.lastName}`
      : '-';
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;

    if (this.isEditMode) {
      this.form.enable();
      this.form.get('username')?.disable();
    } else {
      this.form.disable();
      this.form.get('username')?.disable();
      this.form.markAsUntouched();
    }
  }

  onCancelEdit() {
    this.isEditMode = false;
    this.isMobileNoInvalid = false;
    this.isMatchEmail = false;
    this.form.reset({
      username: this.userData.publicId,
      name: this.userData.firstName,
      surname: this.userData.lastName,
      email: this.userData.email,
      phoneNumber: this.userData.phoneNumber,
      role: this.userData.role,
      managerId: this.userData.managerId || '',
      createdDt: this.userData.createdDt,
      createdBy: this.userData.createdBy,
      updatedDt: this.userData.updatedDt,
      updatedBy: this.userData.updatedBy,
      activeFlag: this.userData.activeFlag
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
        publicId: this.userData.publicId,
        firstName: this.form.value.name,
        lastName: this.form.value.surname,
        email: this.form.value.email,
        phoneNumber: this.form.value.phoneNumber,
        role: this.form.value.role,
        managerId: this.form.value.managerId || null
      };

      const res = await this.userManagementService.updateUserDetail(payload, this.userData.id);

      if (res.resultCode === RESPONSE.SUCCESS) {
        this.getUserData();
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
      this.modalConditionComponent.onClose();
      const res = await this.userManagementService.deleteUser(id);
      if (res.resultCode === RESPONSE.SUCCESS) {
        this.handleSuccessDelete();
      } else {
        this.handleFailDelete();
      }
    } catch (error) {
      console.error('Response error', error);
      this.handleCommonError();
    } finally {
      this.isLoadingDelete = false;
    }
  }

  onDelete() {
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
