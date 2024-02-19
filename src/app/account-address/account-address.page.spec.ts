import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountAddressPage } from './account-address.page';

describe('AccountAddressPage', () => {
  let component: AccountAddressPage;
  let fixture: ComponentFixture<AccountAddressPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AccountAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
