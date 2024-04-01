import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBalancePage } from './my-balance.page';

describe('MyBalancePage', () => {
  let component: MyBalancePage;
  let fixture: ComponentFixture<MyBalancePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyBalancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
