import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRestaurantFormPageComponent } from './admin-restaurant-form-page.component';

describe('AdminRestaurantFormPageComponent', () => {
  let component: AdminRestaurantFormPageComponent;
  let fixture: ComponentFixture<AdminRestaurantFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRestaurantFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRestaurantFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
