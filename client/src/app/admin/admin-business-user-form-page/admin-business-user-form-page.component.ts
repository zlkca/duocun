import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { Account } from '../../shared/lb-sdk';

@Component({
    selector: 'app-admin-business-user-form-page',
    templateUrl: './admin-business-user-form-page.component.html',
    styleUrls: ['./admin-business-user-form-page.component.scss']
})
export class AdminBusinessUserFormPageComponent implements OnInit {

    user;

    constructor(private route: ActivatedRoute, private accountSvc: AccountService) { }

    ngOnInit() {
        const self = this;

        self.route.params.subscribe((params: any) => {
            if (params.id) {
                this.accountSvc.findById(params.id).subscribe(
                    (p: Account) => {
                        self.user = p;
                    });
            } else {
                self.user = new Account();
            }
        });
    }

}
