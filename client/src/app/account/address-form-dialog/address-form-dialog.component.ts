import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '../../../../node_modules/@angular/material';

export interface IAddressFormDialogData {
  title: string;
  content: string;
  buttonTextNo: string;
  buttonTextYes: string;
}

@Component({
  selector: 'app-address-form-dialog',
  templateUrl: './address-form-dialog.component.html',
  styleUrls: ['./address-form-dialog.component.scss']
})
export class AddressFormDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddressFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAddressFormDialogData) { }

  ngOnInit() {
  }

}
