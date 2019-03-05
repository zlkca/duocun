import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  year: number = 2018;

  constructor(private router: Router) {

  }

  ngOnInit() {
  }

  toHome() {
    this.router.navigate(['home']);
  }

  toOrder() {
    this.router.navigate(['orders']);
  }

  toCart() {
    this.router.navigate(['orders']);
  }

  toAccount() {
    this.router.navigate(['login']);
  }
}
