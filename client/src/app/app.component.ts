import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from '../../node_modules/rxjs';

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
  ) {
    const self = this;
    window.addEventListener('orientationchange', function () {
      window.location.reload();
    }, false);
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
