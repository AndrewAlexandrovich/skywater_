import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MyBalancePage } from './my-balance.page';

const routes: Routes = [
  {
    path: '',
    component: MyBalancePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyBalancePageRoutingModule {}
