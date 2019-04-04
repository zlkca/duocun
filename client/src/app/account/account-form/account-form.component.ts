import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../account.service';
import { Account } from '../account.model';


@Component({
  selector: 'app-account-form',
  templateUrl: './account-form.component.html',
  styleUrls: ['./account-form.component.scss']
})
export class AccountFormComponent implements OnInit, OnChanges {
  currentAccount: Account;
  form: FormGroup;
  accountTypes: string[] = [
    'super',
    'business',
    'user',
    'deliver'
  ];

  @Input() account: Account;
  @Output() valueSave = new EventEmitter();

  constructor(private fb: FormBuilder,
    private accountSvc: AccountService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnChanges(changes) {
    if (this.form && changes.account.currentValue) {
      this.form.patchValue(changes.account.currentValue);
    }
  }

  ngOnInit() {
    const self = this;
    if (!this.account) {
      this.account = new Account();
    }
    this.form.patchValue(this.account);
  }

  save() {
    // This component will be used for business admin and super admin!
    const self = this;
    const v = this.form.value;
    const account = new Account(this.form.value);

    account.id = self.account ? self.account.id : null;
    if (!v.password) {
      v.password = this.accountSvc.DEFAULT_PASSWORD;
    }
    if (account.id) {
      self.accountSvc.replace(account).subscribe((r: any) => {
        self.valueSave.emit({ name: 'OnUpdateAccount' });
      });
    } else {
      self.accountSvc.create(account).subscribe((r: any) => {
        self.valueSave.emit({ name: 'OnUpdateAccount' });
      });
    }
  }

  cancel() {
    const self = this;
    self.form.patchValue(this.account);
  }

}
