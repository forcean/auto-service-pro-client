import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [

  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    // canActivate: [NativeLoginGuard],
    loadChildren: async () => {
      try {
        return await import('./pages/auth/auth.module').then((m) => m.AuthModule);
      } catch (error) {
        throw new Error('Failed to load LoginModule');
      }
    }
  },
  {
    path: 'portal',
    canActivate: [AuthGuard],
    loadChildren: async () => {
      try {
        return await import('./pages/common-layout-pages.module').then((m) => m.CommonLayoutPagesModule);
      } catch (error) {
        throw new Error('Failed to load CommonLayoutPagesModule');
      }
    }
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
    children: [{ path: '', component: NotFoundComponent }]
  },
  { path: '**', redirectTo: '/not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
