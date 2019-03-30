import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerOrderComponent } from './worker-order.component';

describe('WorkerOrderComponent', () => {
  let component: WorkerOrderComponent;
  let fixture: ComponentFixture<WorkerOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkerOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
