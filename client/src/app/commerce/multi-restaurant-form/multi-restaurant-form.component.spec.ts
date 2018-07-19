import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiRestaurantFormComponent } from './multi-restaurant-form.component';

describe('MultiRestaurantFormComponent', () => {
  let component: MultiRestaurantFormComponent;
  let fixture: ComponentFixture<MultiRestaurantFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiRestaurantFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiRestaurantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
