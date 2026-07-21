import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleRoutingModule } from './vehicle-routing.module';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { SharedModule } from '../../shared/shared.module';
import { BadgeInfo, Car, CircleCheckBig, CircleOff, CircleX, ClipboardList, LucideAngularModule, User, Users, Wrench }from 'lucide-angular';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    VehicleListComponent,
    VehicleDetailComponent,
    VehicleFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VehicleRoutingModule,
    SharedModule,
    LucideAngularModule.pick({
          Wrench,
          CircleCheckBig,
          CircleOff,
          Users,
          ClipboardList,
          CircleX,
          BadgeInfo,
          Car,
          User
        }),
  ]
})
export class VehicleModule { }
