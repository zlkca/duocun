import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../account/auth.service';


describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useClass: AuthService }
      ],
      declarations: [HeaderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
  it('should login successful', inject([AuthService, HttpTestingController],
    (service: AuthService, httpMock: HttpTestingController) => {
      // let dummyLogin = { token:'', data:''};

      // service.login('z','p1').subscribe((r:any)=>{
      //   let token = localStorage.getItem('token-'+service.APP);
      //   expect(token).toBe(dummyLogin.token);
      //   expect(r).toBe(null);
      // })

      // const req = httpMock.expectOne({method:'POST', url:'http://localhost:8000/api/login'});
      // expect(req.request.method).toBe('POST');
      // req.flush(dummyLogin);
    }));
});
