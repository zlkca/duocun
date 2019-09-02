import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-feedback',
  providers: [AccountService],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})

export class FeedbackComponent implements OnInit {
  private _success = new Subject<string>();
  private _fail = new Subject<string>();

  staticAlertClosed = false;
  successMessage: string;
  failMessage: string;
  public username: string;
  public email: string;
  public phone: string;
  public message: string;

  constructor(private userServ: AccountService) { }

  ngOnInit() {
    setTimeout(() => this.staticAlertClosed = true, 10000);
    this._success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this._success, 3000).subscribe(() => this.successMessage = null);

    this._fail.subscribe((message) => this.failMessage = message);
    debounceTime.call(this._fail, 3000).subscribe(() => this.failMessage = null);
  }

  public changeSuccessMessage() {
    this._success.next(`Feedback successfully send.`);
  }

  public changeFailMessage() {
    this._fail.next(`invalid Feedback field.`);
  }

  onSubmitFeedback() {
    　const self = this;

    if (self.hasSpecialChar(this.message) || self.hasSpecialChar(this.username) ||
      self.hasSpecialChar(this.email) || self.hasSpecialChar(this.phone)) {
      self.changeFailMessage();
      return;
    }

    self.changeSuccessMessage();

    // this.userServ.postFeedback(this.username, this.email, this.phone, this.message).subscribe(
    //     (data) => {
    //       let k = data;
    //     },
    //     (err)=>{});
  }

  hasSpecialChar(v) {
    var format = /[!#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/;
    return format.test(v);
  }
}


