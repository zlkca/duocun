import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Account } from '../account/account.model';
import { IAppState } from '../store';
import { CommandActions } from '../shared/command.actions';
import { takeUntil } from '../../../node_modules/rxjs/operators';
import { Subject } from '../../../node_modules/rxjs';
import { ContactService } from '../contact/contact.service';
import { LocationService } from '../location/location.service';
import { IContact } from '../contact/contact.model';
import { ContactActions } from '../contact/contact.actions';
import { IContactAction } from '../contact/contact.reducer';
import { ICommand } from '../shared/command.reducers';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  year = 2018;
  account: Account;
  bHide = false;

  private onDestroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private rx: NgRedux<IAppState>,
    private contactSvc: ContactService,
    private locationSvc: LocationService
  ) {
    const self = this;
    this.rx.select('account').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((account: Account) => {
      self.account = account;
    });

    // this.rx.select('location').pipe(
    //   takeUntil(this.onDestroy$)
    // ).subscribe((loc: ILocation) => {
    //   self.location = loc;
    // });
    this.rx.select<string>('page').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(x => {
      if (x === 'contact-form' || x === 'phone-form' || x === 'address-form' || x === 'restaurant-detail' || x === 'cart' ||
       x === 'order-confirm' || x === 'home') {
        self.bHide = true;
      } else {
        self.bHide = false;
      }
    });

    this.rx.select<ICommand>('cmd').pipe(
      takeUntil(this.onDestroy$)
    ).subscribe((x: ICommand) => {
      if (x.name === 'loggedIn') {
        self.bHide = false;
      }
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toHome() {
    this.rx.dispatch({
      type: CommandActions.SEND,
      payload: { name: 'clear-location-list', args: null }
    });

    this.contactSvc.find({ where: { accountId: this.account.id } }).subscribe((r: IContact[]) => {
      if (r && r.length > 0 && r[0].location) {
        this.router.navigate(['main/filter']);
      } else {
        this.router.navigate(['main/home']);
      }
    });
  }

  toOrder() {
    if (this.account) {
      if (this.account.type === 'user' || this.account.type === 'super') {
        this.router.navigate(['order/history']);
      } else if (this.account.type === 'worker') {
        this.router.navigate(['order/list-worker']);
      } else if (this.account.type === 'restaurant') {
        this.router.navigate(['order/list-restaurant']);
      } else {
        this.router.navigate(['account/login']);
      }
    } else {
      this.router.navigate(['account/login']);
    }
  }

  toCart() {
    this.router.navigate(['cart']);
  }

  toAccount() {
    this.rx.dispatch<IContactAction>({
      type: ContactActions.UPDATE,
      payload: null
    });
    if (this.account) {
      this.router.navigate(['account/setting']);
    } else {
      this.router.navigate(['account/login']);
    }
  }

  toAdmin() {
    if (this.account) {
      this.router.navigate(['admin']);
    } else {
      this.router.navigate(['account/login']);
    }
  }



  // saveContact() {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'save-contact', args: null}
  //   });
  // }

  // cancelContact() {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'cancel-contact', args: null}
  //   });
  // }
}
