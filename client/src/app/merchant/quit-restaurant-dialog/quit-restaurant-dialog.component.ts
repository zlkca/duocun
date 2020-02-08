import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { NgRedux } from '../../../../node_modules/@angular-redux/store';
import { IAppState } from '../../store';
import { CartActions } from '../../cart/cart.actions';
import { Router } from '@angular/router';

export interface DialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
  merchantId: string;
  fromPage: string;
  onSchedule: string;
}

@Component({
  selector: 'app-quit-restaurant-dialog',
  templateUrl: './quit-restaurant-dialog.component.html',
  styleUrls: ['./quit-restaurant-dialog.component.scss']
})
export class QuitRestaurantDialogComponent implements OnInit {

  constructor(
    private rx: NgRedux<IAppState>,
    private router: Router,
    private ngZone: NgZone,
    public dialogRef: MatDialogRef<QuitRestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {

  }

  onLeave() {
    const self = this;
    this.ngZone.run(() => {
    this.dialogRef.close({action: 'leave', parent: 'merchant-detail'});

      self.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
      if (self.data && self.data.fromPage === 'restaurant-list') {
        self.router.navigate(['main/home']);
      } else if (self.data.fromPage === 'order-history') {
        self.router.navigate(['order/history']);
      }
    });
  }

  onStay() {
    this.dialogRef.close({action: 'stay',
      parent: 'merchant-detial',
      merchantId: this.data.merchantId,
      onSchedule: this.data.onSchedule
    });
    this.router.navigate(['merchant/list/' + this.data.merchantId + '/' + this.data.onSchedule]);
  }
}

