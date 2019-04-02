import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryFormPageComponent } from './delivery-form-page.component';

describe('DeliveryFormPageComponent', () => {
  let component: DeliveryFormPageComponent;
  let fixture: ComponentFixture<DeliveryFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
