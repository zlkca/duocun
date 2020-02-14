import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { CartActions } from '../../cart/cart.actions';
import { Router} from '@angular/router';
import { Subject } from '../../../../node_modules/rxjs';

export interface IDialogData {
  merchantId: string;
  fromPage: string;
  onSchedule: string;
  targetUrl: string;
}

@Component({
  selector: 'app-quit-restaurant-dialog',
  templateUrl: './quit-restaurant-dialog.component.html',
  styleUrls: ['./quit-restaurant-dialog.component.scss']
})
export class QuitRestaurantDialogComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject();
  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    public dialogRef: MatDialogRef<QuitRestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData
  ) { }

  ngOnInit() {

  }
  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  onLeave() {
    this.dialogRef.close({action: 'leave'});
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
    this.router.navigate(['merchant/list/' + this.data.merchantId + '/' + this.data.onSchedule]); // !!! used for close dialog

    setTimeout(() => {
      this.router.navigate(['main/home']);
    }, 200);
    // this.router.navigate(['main/home']);
    // if (this.data && this.data.fromPage === 'restaurant-list') {
      // this.router.navigate(['main/home']);
    // } else if (this.data.fromPage === 'order-history') {
    //   this.router.navigate(['order/history']);
    // }
    // setTimeout(() => {
    //   this.router.navigate(['main/home']);
    // }, 200);
  }

  onStay() {
    this.dialogRef.close({action: 'stay', targetUrl: this.data.targetUrl});
    this.router.navigate(['merchant/list/' + this.data.merchantId + '/' + this.data.onSchedule]);
  }
}

