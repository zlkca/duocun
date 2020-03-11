import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
@Component({
  selector: 'app-product-spec-confirm-modal',
  templateUrl: './product-spec-confirm-modal.component.html',
  styleUrls: ['./product-spec-confirm-modal.component.css']
})
export class ProductSpecConfirmModalComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ProductSpecConfirmModalComponent>,
    @Inject(MAT_DIALOG_DATA) data
  ) { }

  ngOnInit() {
  }

  save() {
    this.dialogRef.close('save');
  }
  clear () {
    this.dialogRef.close('clear');
  }

}
