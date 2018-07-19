import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiImageUploaderComponent } from './multi-image-uploader.component';

describe('MultiImageUploaderComponent', () => {
  let component: MultiImageUploaderComponent;
  let fixture: ComponentFixture<MultiImageUploaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiImageUploaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiImageUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
