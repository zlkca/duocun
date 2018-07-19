import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBusinessUserFormComponent } from './admin-business-user-form.component';

describe('AdminBusinessUserFormComponent', () => {
  let component: AdminBusinessUserFormComponent;
  let fixture: ComponentFixture<AdminBusinessUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminBusinessUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminBusinessUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
