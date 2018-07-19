import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionSignupComponent } from './institution-signup.component';

describe('InstitutionSignupComponent', () => {
  let component: InstitutionSignupComponent;
  let fixture: ComponentFixture<InstitutionSignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstitutionSignupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
