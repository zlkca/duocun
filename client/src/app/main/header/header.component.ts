import { Component, OnInit } from '@angular/core';

@Component({
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
  isShown = false;

  constructor(
  ) { }

  ngOnInit() {
  }

  toMerchant() {
    this.isShown = false;
    window.location.href = 'https://duocun.ca/merchant';
  }
}
