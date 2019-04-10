import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneFormPageComponent } from './phone-form-page.component';

describe('PhoneFormPageComponent', () => {
  let component: PhoneFormPageComponent;
  let fixture: ComponentFixture<PhoneFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
