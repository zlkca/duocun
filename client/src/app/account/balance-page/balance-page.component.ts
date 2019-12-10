import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AccountService } from '../../account/account.service';
import { Subject } from '../../../../node_modules/rxjs';
import { takeUntil } from '../../../../node_modules/rxjs/operators';
import { Role, IAccount } from '../../account/account.model';
import { TransactionService } from '../../transaction/transaction.service';

@Component({
  selector: 'app-balance-page',
  templateUrl: './balance-page.component.html',
  styleUrls: ['./balance-page.component.scss']
})
export class BalancePageComponent implements OnInit, OnDestroy {
  onDestroy$ = new Subject();
  account;
  alexcredits;
  displayedColumns: string[] = ['date', 'description', 'consumed', 'paid', 'balance'];
  list = [];
  currentPageNumber = 1;
  itemsPerPage = 15;
  transactions = [];
  nTransactions = 0;
  loading = true;
  highlightedId = 0;

  constructor(
    private accountSvc: AccountService,
    private transactionSvc: TransactionService
  ) {

  }

  ngOnInit() {
    const self = this;
    this.accountSvc.getCurrentUser().pipe(takeUntil(this.onDestroy$)).subscribe((account: IAccount) => {
      this.account = account;
      if (account) {
        this.OnPageChange(this.currentPageNumber);
      } else {

      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  groupBy(items, key) {
    return items.reduce((result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }), {});
  }

  getDescription(t, clientId) {
    if (t.action === 'client cancel order from duocun') {
      return '取消' + t.toName;
    } else if (t.action === 'pay by card') {
      return '银行卡付款';
    } else if (t.action === 'pay by wechat') {
      return '微信付款';
    } else if (t.action === 'client add credit by cash') {
      return '现金充值';
    } else if (t.action === 'client add credit by card') {
      return '信用卡充值';
    } else if (t.action === 'client add credit by WECHATPAY') {
      return '微信充值';
    } else {
      return t.fromId === clientId ? t.toName : t.fromName;
    }
  }

  OnPageChange(pageNumber) {
    const accountId = this.account._id;
    const itemsPerPage = this.itemsPerPage;
    const clientId = this.account._id;

    this.loading = true;
    this.currentPageNumber = pageNumber;
    const query = { $or: [{ fromId: clientId }, { toId: clientId }], amount: { $ne: 0 } };
    this.transactionSvc.loadPage(query, pageNumber, itemsPerPage).pipe(takeUntil(this.onDestroy$)).subscribe((ret: any) => {
      this.nTransactions = ret.total;
      const list = [];
      ret.transactions.map(t => {
        const b = t.fromId === clientId ? t.fromBalance : t.toBalance;
        const description = this.getDescription(t, clientId);
        const consumed = t.toId === clientId ? t.amount : 0;
        const paid = t.fromId === clientId ? t.amount : 0;
        list.push({ date: t.created, description: description, consumed: consumed, paid: paid, balance: -b });
      });

      this.transactions = list;
      this.loading = false;
    });
  }
}

