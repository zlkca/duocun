import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { SharedService } from '../../shared/shared.service';
import { Account } from '../../shared/lb-sdk';

@Component({
    selector: 'app-admin-business-user-form',
    templateUrl: './admin-business-user-form.component.html',
    styleUrls: ['./admin-business-user-form.component.scss']
})
export class AdminBusinessUserFormComponent implements OnInit {
    @Input() user;
    errMsg: string;
    form: FormGroup;

    constructor(private fb: FormBuilder,
        private accountSvc: AccountService,
        private router: Router,
        private sharedServ: SharedService) {

        this.form = this.fb.group({
            username: ['', Validators.required],
            email: ['', Validators.required],
            password: ['', Validators.required],
            type: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.form.patchValue({
            username: this.user.username,
            email: this.user.email,
            password: this.user.password,
            type: this.user.type
        });
    }

    save() {
        const self = this;
        const v = new Account(this.form.value);
        v.id = this.user.id;
        if (!v.password) {
            v.password = this.accountSvc.DEFAULT_PASSWORD;
        }
        this.accountSvc.replaceOrCreate(v).subscribe((r: Account) => {
            if (r.id) {
                self.router.navigate(['admin']);
            } else {
                alert('Duplicated username or email');
            }
        });
    }
}


