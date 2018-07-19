import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstitutionLoginComponent } from './institution-login.component';

describe('InstitutionLoginComponent', () => {
  let component: InstitutionLoginComponent;
  let fixture: ComponentFixture<InstitutionLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstitutionLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstitutionLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
