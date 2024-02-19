import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountOrdersPageRoutingModule } from './account-orders-routing.module';

import { AccountOrdersPage } from './account-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountOrdersPageRoutingModule
  ],
  declarations: [AccountOrdersPage]
})
export class AccountOrdersPageModule {}
