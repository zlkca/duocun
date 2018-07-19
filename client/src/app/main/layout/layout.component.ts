import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../../account/account.service';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
    constructor(
        private router: Router,
        private accountServ: AccountService
    ) { }

    ngOnInit() {
        if (this.accountServ.isAuthenticated) {
            this.router.navigate(['home']);
        } else {
            this.router.navigate(['login']);
        }
    }
}
