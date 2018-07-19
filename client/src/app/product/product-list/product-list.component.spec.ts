import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { CommerceService } from '../commerce.service';
import { ProductListComponent } from './product-list.component';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductListComponent ],
      imports:[ FormsModule, RouterTestingModule, HttpClientTestingModule ],
      providers: [ 
        { provide: CommerceService, useClass: CommerceService } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([CommerceService, HttpTestingController], (service: CommerceService, httpMock:HttpTestingController) => {
    expect(component).toBeTruthy();
  }));
});
