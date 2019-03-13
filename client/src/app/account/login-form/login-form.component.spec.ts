import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedService } from '../../shared/shared.service';
import { AuthService } from '../auth.service';
import { LoginFormComponent } from './login-form.component';

// class MockAuthService extends AuthService {
//   login(account: string, password: string): Observable<any> {
//     return new Observable<any>((observer)=>{
//       const {next, error} = observer;
//       next({'token':'aaa', 'data':{username:'zlk', password:'123456', email:'zlk@gmail.com'}});
//       return {unsubscribe() { }};
//     });
//   }
// }

describe('LoginFormCompoent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormCompoent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
     declarations: [ LoginFormCompoent ],
      imports:[ FormsModule, RouterTestingModule, HttpClientTestingModule ],
      providers: [ 
        { provide: AuthService, useClass: AuthService },
        { provide: SharedService, useClass: SharedService} ]
    })
    .compileComponents();
    // TestBed.overrideComponent(
    //   //LoginFormCompoent,
    //   //{set: {providers: [{provide: AuthService, useClass: AuthService}]}}
    // );
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormCompoent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([AuthService, HttpTestingController, SharedService], 
      (service: AuthService, httpMock:HttpTestingController, sharedServ:SharedService) => {
        expect(component).toBeTruthy();
      }
  ));

  it('should login successful', inject([AuthService, HttpTestingController, SharedService], 
      (service: AuthService, httpMock:HttpTestingController, sharedServ:SharedService) => {
        let form: NgForm = new NgForm([], []);
        component.onLogin(form);

        expect(component.errMsg).toBe('');
  }));
});
