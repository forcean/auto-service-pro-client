import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: '', redirectTo: 'portal/landing', pathMatch: 'full' },

  // {
  //   path: 'portal',
  //   loadChildren: () =>
  //     import('./pages/common-layout-pages.module').then(
  //       m => m.CommonLayoutPagesModule
  //     ),
  // }
  {
    path: 'portal',
    // canActivate: [AuthGuard],
    loadChildren: async () => {
      try {
        return await import('./pages/common-layout-pages.module').then((m) => m.CommonLayoutPagesModule);
      } catch (error) {
        throw new Error('Failed to load CommonLayoutPagesModule');
      }
    }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
