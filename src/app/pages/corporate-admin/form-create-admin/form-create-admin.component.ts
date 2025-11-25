import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-create-admin',
  standalone: false,
  templateUrl: './form-create-admin.component.html',
  styleUrl: './form-create-admin.component.scss'
})
export class FormCreateAdminComponent implements OnInit {

  form!: FormGroup;
  managerList: any[] = [];
  mustSelectManager = false;

  constructor(
    private fb: FormBuilder,
    // private userService: UserService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', Validators.email],
      role: ['', Validators.required],
      managerId: [''], // เฉพาะบาง role ที่ต้องเลือก manager
    });

    // โหลด manager list จาก backend
    this.loadManagerList();
  }

  loadManagerList() {
    // this.userService.getManagers().subscribe({
    //   next: (res) => {
    //     this.managerList = res.data;
    //   }
    // });
  }

  onRoleChange() {
    const role = this.form.get('role')?.value;

    // ถ้าเป็น role ที่ต้องสังกัด manager
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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // this.userService.createUser(this.form.value).subscribe({
    //   next: () => alert('สร้างผู้ใช้สำเร็จ'),
    //   error: () => alert('เกิดข้อผิดพลาด'),
    // });
  }
}