import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { SharedService } from '../shared.service';
import { environment } from '../../../environments/environment';
import { LocationService } from '../location/location.service';
import { ILocation } from '../location/location.model';
import { AccountService } from '../../account/account.service';
import { Account } from '../../lb-sdk';
declare var $: any;

const APP = environment.APP;

@Component({
  providers: [AuthService, LocationService],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogin = false;
  menu: any[];
  user: any;
  keyword: string;
  locality = '';
  type: string;
  addr = null;

  constructor(private router: Router, private authSvc: AuthService,
    private locationSvc: LocationService,
    private accountServ: AccountService,
    private sharedSvc: SharedService) { }

  ngOnInit() {
    this.accountServ.getCurrent().subscribe(
      (account: Account) => {
        if (account && account.id) {
          this.user = account;
          this.type = account.type;
          this.isLogin = true;
        } else {
          this.user = null;
          this.isLogin = false;
        }
      });

    // this.locationSvc.get().subscribe((addr: ILocation) => {
    //     this.locality = addr && (addr.sub_locality || addr.city);
    // });
    const self = this;
    const s = localStorage.getItem('location-' + APP);

    if (s) {
      this.addr = JSON.parse(s);
    }

    this.sharedSvc.getMsg().subscribe(r => {
      if (r.name === 'OnUpdateAddress') {
        this.addr = r.addr;
      }
    });
  }

  getCurrentCity() {
    if (this.addr) {
      return this.addr.sub_locality ? this.addr.sub_locality : this.addr.city;
    } else {
      return '';
    }
  }

  search(keyword) {
    const self = this;
    self.sharedSvc.emitMsg({ name: 'OnSearch', query: { 'keyword': keyword } });
  }

  closeNavMenu() {
    $('.navbar-collapse').removeClass('show');
  }

  toPage(url) {
    this.closeNavMenu();
    this.router.navigate([url]);
  }

  changeAddress() {
    this.closeNavMenu();
    this.locationSvc.clear();
    this.router.navigate(['my-address']);
    this.addr = null;
  }

  changeLanguage(code) {
    this.closeNavMenu();
    // this.translateServ.use(code);
  }

  logout() {
    this.closeNavMenu();
    this.accountServ.logout()
      .subscribe((sad: any) => {
        console.log(sad);
        this.user = null;
        this.isLogin = false;
        this.router.navigate(['home']);
      });
  }

  toHome() {
    // if (this.user) {
    // if (this.user.type === 'super') {
    //     this.router.navigate(['admin']);
    // } else if (this.user.type === 'business') {
    //     this.router.navigate(['dashboard']);
    // } else {
    this.closeNavMenu();
    const location = localStorage.getItem('location-' + APP);
    if (location) {
      this.router.navigate(['home']);
    } else {
      this.router.navigate(['my-address']);
    }
    // }
    // }
  }

  toBusinessCenter() {
    // if login and user is business, redirect to business center, otherwise redirect to business signup
    const self = this;
    this.closeNavMenu();

    // check from token
    this.accountServ.getCurrent().subscribe(
      (r: Account) => {
        self.isLogin = r && r.id ? true : false;
        if (self.isLogin) {
          if (r.type === 'business' || r.type === 'super') {
            self.router.navigate(['admin']);
          } else {
            self.accountServ.logout().subscribe(() => {
              self.router.navigate(['institution-signup']);
            });
          }
        } else {
          self.router.navigate(['institution-signup']);
          // self.router.navigate(['institution-login']);
        }
      });
  }
}
