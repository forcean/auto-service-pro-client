import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductCreateComponent } from './product-create/product-create.component';
import { ProductUpdateComponent } from './product-update/product-update.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

const routes: Routes = [
  {
    path: 'list',
    component: ProductListComponent,
  },
  {
    path: 'create',
    component: ProductCreateComponent,
  },
  {
    path: 'update/:id',
    component: ProductUpdateComponent
  },
  {
    path: 'detail/:id',
    component: ProductDetailComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
