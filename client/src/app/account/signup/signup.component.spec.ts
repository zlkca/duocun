import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../auth.service';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {    
    TestBed.configureTestingModule({
     declarations: [ SignupComponent ],
      imports:[ FormsModule, RouterTestingModule, HttpClientTestingModule ],
      providers: [ 
        { provide: AuthService, useClass: AuthService },
        { provide: SharedService, useClass: SharedService} ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', inject([AuthService, HttpTestingController, SharedService], 
      (service: AuthService, httpMock:HttpTestingController, sharedServ:SharedService) => {
        expect(component).toBeTruthy();
      }
  ));
});
