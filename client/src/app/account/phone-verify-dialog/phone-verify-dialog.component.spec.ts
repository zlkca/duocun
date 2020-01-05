import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneVerifyDialogComponent } from './phone-verify-dialog.component';

describe('PhoneVerifyDialogComponent', () => {
  let component: PhoneVerifyDialogComponent;
  let fixture: ComponentFixture<PhoneVerifyDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhoneVerifyDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhoneVerifyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
