import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBusinessUserFormPageComponent } from './admin-business-user-form-page.component';

describe('AdminBusinessUserFormPageComponent', () => {
  let component: AdminBusinessUserFormPageComponent;
  let fixture: ComponentFixture<AdminBusinessUserFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminBusinessUserFormPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBusinessUserFormPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
