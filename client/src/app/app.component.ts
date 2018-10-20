import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './account/auth.service';
import { SharedService } from './shared/shared.service';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { environment } from '../environments/environment';
import { SocketConnection } from './shared/lb-sdk/sockets/socket.connections';

const APP = environment.APP;

@Component({
  providers: [AuthService],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private sharedServ: SharedService,
    private authServ: AuthService,
    private socket: SocketConnection,
  ) {

    window.addEventListener('orientationchange', function () {
      window.location.reload();
    }, false);

    // load google api lib
    // GoogleMapsLoader.loadJs();
  }

  ngOnInit() {
    // this.socket.connect(this.authServ.getToken());
    // const self = this;

    // const s = localStorage.getItem('location-' + APP);
    // if (s) {
    //     self.router.navigate(['restaurants']);
    // } else {
    //     self.router.navigate(['home']);
    // }

    // self.authServ.hasLoggedIn().subscribe(
    //     (r: any) => {
    //         self.isLogin = r ? true : false;
    //         self.ngRedux.dispatch({ type: AccountActions.LOGIN, payload: r });
    //         if (self.isLogin) {
    //             if (r.type === 'super' || r.type === 'business') {
    //                 self.toPage("admin");
    //             } else {
    //                 self.toPage("restaurants");
    //             }
    //         } else {
    //             self.toPage("restaurants");
    //         }
    //     }, (err: any) => {
    //         self.toPage("login");
    //     });
  }

  toPage(url: string) {
    this.router.navigate([url]);
  }
}
