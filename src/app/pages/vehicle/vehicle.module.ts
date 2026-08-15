import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleRoutingModule } from './vehicle-routing.module';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { VehicleDetailComponent } from './vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicle-form/vehicle-form.component';
import { SharedModule } from '../../shared/shared.module';
import {
  ArrowLeft,
  BadgeInfo,
  Car,
  ChevronRight,
  CircleCheckBig,
  CircleOff,
  CircleX,
  ClipboardList,
  Copy,
  FileText,
  Gauge,
  LayoutDashboard,
  LucideAngularModule,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  Wrench,
  Image,
  History,
  ChevronLeft
} from 'lucide-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { ProvincePipe } from "../../shared/pipes/province.pipe";

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
        User,
        ArrowLeft,
        ChevronRight,
        ChevronLeft,
        Plus,
        Pencil,
        Trash2,
        Gauge,
        Copy,
        Phone,
        Mail,
        LayoutDashboard,
        History,
        FileText,
        Image,
    }),
    ProvincePipe
],
})
export class VehicleModule {}
