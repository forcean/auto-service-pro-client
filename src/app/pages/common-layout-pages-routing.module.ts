import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonLayoutPagesComponent } from './common-layout-pages.component';
import { LandingComponent } from './landing/landing.component';

// import { AuthGuard } from '../core/guards/auth.guard';
// import { GuidebookComponent } from './guidebook/guidebook.component';
// import { SenderNameComponent } from './sender-name/sender-name.component';
// import { ProfileDetailComponent } from './user-permission/profile-detail/profile-detail.component';
// import { AdminSenderNameComponent } from './admin-sender-name/admin-sender-name.component';

const routes: Routes = [
  {
    path: '',
    component: CommonLayoutPagesComponent,
    children: [
      {
        path: 'landing',
        component: LandingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CommonLayoutPagesRoutingModule { }
