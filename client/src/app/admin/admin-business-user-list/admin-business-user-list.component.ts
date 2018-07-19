import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../account/account.service';

@Component({
    selector: 'app-admin-business-user-list',
    templateUrl: './admin-business-user-list.component.html',
    styleUrls: ['./admin-business-user-list.component.scss']
})
export class AdminBusinessUserListComponent implements OnInit {
    users = [];

    constructor(private router: Router, private accountSvc: AccountService) {

    }

    ngOnInit() {
        const self = this;
        self.accountSvc.find({where: {type: 'business'}}).subscribe(users => {
            self.users = users;
        });
    }

    add() {
        this.router.navigate(['admin/user']);
    }

    change(user) {
        this.router.navigate(['admin/users/' + user.id]);
    }
}
