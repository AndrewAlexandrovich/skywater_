import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountOrdersPage } from './account-orders.page';

describe('AccountOrdersPage', () => {
  let component: AccountOrdersPage;
  let fixture: ComponentFixture<AccountOrdersPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AccountOrdersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
