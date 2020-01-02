import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneVerifyPageComponent } from './phone-verify-page.component';

describe('PhoneVerifyPageComponent', () => {
  let component: PhoneVerifyPageComponent;
  let fixture: ComponentFixture<PhoneVerifyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneVerifyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneVerifyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
