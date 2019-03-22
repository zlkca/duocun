import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { SocketConnection } from '../../lb-sdk/sockets/socket.connections';
import { AuthService } from '../../account/auth.service';

@Component({
  selector: 'app-worker-order',
  templateUrl: './worker-order.component.html',
  styleUrls: ['./worker-order.component.scss']
})
export class WorkerOrderComponent implements OnInit {

  subscrAccount;
  account: Account;
  orders = [];

  constructor(
    private authSvc: AuthService,
    private accountSvc: AccountService,
    private socket: SocketConnection
  ) { }

  ngOnInit() {
    const self = this;
    this.subscrAccount = this.accountSvc.getCurrent().subscribe((account: any) => {
        self.account = account;
      });

      this.socket.connect(this.authSvc.getToken());
      this.socket.on('updateWorkerOrders', x => {
        if (x.account.id === self.account.id) {
          self.orders.push(x.order);
        }
        // self.onFilterOrders(this.selectedRange);
      });
  }

}
