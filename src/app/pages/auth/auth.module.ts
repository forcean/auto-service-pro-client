import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    RegisterComponent, LoginComponent
  ],
  imports: [
    CommonModule, FormsModule,
    AuthRoutingModule, SharedModule, ReactiveFormsModule
  ]
})
export class AuthModule { }
