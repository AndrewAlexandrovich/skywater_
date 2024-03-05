import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessOrderPage } from './success-order.page';

describe('SuccessOrderPage', () => {
  let component: SuccessOrderPage;
  let fixture: ComponentFixture<SuccessOrderPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SuccessOrderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
