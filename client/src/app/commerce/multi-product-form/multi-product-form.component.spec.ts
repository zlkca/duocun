import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiProductEditorComponent } from './multi-product-editor.component';

describe('MultiProductEditorComponent', () => {
  let component: MultiProductEditorComponent;
  let fixture: ComponentFixture<MultiProductEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiProductEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiProductEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
