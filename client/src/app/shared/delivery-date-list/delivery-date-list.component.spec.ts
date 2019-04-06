import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDateListComponent } from './delivery-date-list.component';

describe('DeliveryDateListComponent', () => {
  let component: DeliveryDateListComponent;
  let fixture: ComponentFixture<DeliveryDateListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryDateListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryDateListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
