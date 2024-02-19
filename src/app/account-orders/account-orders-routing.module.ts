import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountOrdersPage } from './account-orders.page';

const routes: Routes = [
  {
    path: '',
    component: AccountOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountOrdersPageRoutingModule {}
