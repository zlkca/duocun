import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MallFormComponent } from './mall-form.component';

describe('MallFormComponent', () => {
  let component: MallFormComponent;
  let fixture: ComponentFixture<MallFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MallFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
