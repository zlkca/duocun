import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrderPageComponent } from './admin-order-page.component';

describe('AdminOrderPageComponent', () => {
  let component: AdminOrderPageComponent;
  let fixture: ComponentFixture<AdminOrderPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminOrderPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminOrderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
