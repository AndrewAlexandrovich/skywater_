import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'product',
    loadChildren: () => import('./product/product.module').then( m => m.ProductPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  {
    path: 'account-address',
    loadChildren: () => import('./account-address/account-address.module').then( m => m.AccountAddressPageModule)
  },
  {
    path: 'account-orders',
    loadChildren: () => import('./account-orders/account-orders.module').then( m => m.AccountOrdersPageModule)
  },
  {
    path: 'success-order',
    loadChildren: () => import('./success-order/success-order.module').then( m => m.SuccessOrderPageModule)
  },
  {
    path: 'my-balance',
    loadChildren: () => import('./my-balance/my-balance.module').then( m => m.MyBalancePageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
