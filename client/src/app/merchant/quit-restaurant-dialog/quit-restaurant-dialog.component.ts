import { Component, OnInit, Inject } from '@angular/core';
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
    public dialogRef: MatDialogRef<QuitRestaurantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit() {

  }

  onClickLeave(): void {
    this.dialogRef.close();
    this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: [] });
    if (this.data.fromPage === 'restaurant-list') {
      this.router.navigate(['main/home']);
    } else if (this.data.fromPage === 'order-history') {
      this.router.navigate(['order/history']);
    }
  }

  onClickStay(): void {
    this.dialogRef.close();
    this.router.navigate(['merchant/list/' + this.data.merchantId + '/' + this.data.onSchedule]);
  }

}

