import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommandActions } from './shared/command.actions';
// import { NgRedux } from '../../node_modules/@angular-redux/store';
// import { IAppState } from './store';
// import { takeUntil } from '../../node_modules/rxjs/operators';
import { Subject } from '../../node_modules/rxjs';
// import { ILocation } from './location/location.model';
// import { LocationService } from './location/location.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  options;
  account;
  deliveryAddress;
  onDestroy$ = new Subject<any>();

  constructor(
    // private locationSvc: LocationService,
    // private rx: NgRedux<IAppState>
  ) {
    const self = this;
    window.addEventListener('orientationchange', function () {
      window.location.reload();
    }, false);

    // this.rx.select<ILocation>('location').pipe(
    //   takeUntil(this.onDestroy$)
    // ).subscribe(loc => {
    //   self.deliveryAddress = self.locationSvc.getAddrString(loc);
    // });
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  // onAddressChange(e) {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'input-address', args: e.input}
  //   });
  // }

  // onAddressClear(e) {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'clear-address-input', args: null}
  //   });
  // }

  // onAddressInputFocus(e) {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'show-location-history', args: null}
  //   });
  // }

  // useCurrentLocation() {
  //   this.rx.dispatch({
  //     type: CommandActions.SEND,
  //     payload: {name: 'use-current-location', args: null}
  //   });
  // }
}
