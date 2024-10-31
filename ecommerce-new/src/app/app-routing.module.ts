import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
import { ProductComponent } from './product/product.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { CartComponent } from './cart/cart.component';

const routes: Routes = [
  {
    path: '', component: LoginComponent,
  },
  {
    path: 'signup', component: SignupComponent,
  },
  
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'product',
    component: ProductComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
