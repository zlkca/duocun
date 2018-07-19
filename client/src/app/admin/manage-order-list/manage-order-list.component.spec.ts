import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageOrderListComponent } from './manage-order-list.component';

describe('ManageOrderListComponent', () => {
  let component: ManageOrderListComponent;
  let fixture: ComponentFixture<ManageOrderListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageOrderListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
