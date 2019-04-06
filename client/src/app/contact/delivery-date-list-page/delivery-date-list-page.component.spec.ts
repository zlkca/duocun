import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryDateListPageComponent } from './delivery-date-list-page.component';

describe('DeliveryDateListPageComponent', () => {
  let component: DeliveryDateListPageComponent;
  let fixture: ComponentFixture<DeliveryDateListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryDateListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryDateListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
