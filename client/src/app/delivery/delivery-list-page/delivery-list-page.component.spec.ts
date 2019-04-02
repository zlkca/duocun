import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryListPageComponent } from './delivery-list-page.component';

describe('DeliveryListPageComponent', () => {
  let component: DeliveryListPageComponent;
  let fixture: ComponentFixture<DeliveryListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
