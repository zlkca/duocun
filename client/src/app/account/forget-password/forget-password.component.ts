import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  providers: [AuthService],
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  errMsg: string;
  form: FormGroup;


  constructor(private fb: FormBuilder, private authServ: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  onTempPassword() {
    // let self = this;

    // this.authServ.forgetPassword(self.email).subscribe(
    //     function(rsp){
    //         self.router.navigate(["/login"]);
    //     }, function(error){
    //       console.error('An error occurred', error);
    //       //return Observable.throw(error.message || error);
    //     });
  }

}
