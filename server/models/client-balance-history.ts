import { DB } from "../db";
import { Model } from "./model";
import { Entity } from "../entity";
import { Request, Response } from "express";
import moment from "moment-timezone";
import { OrderStatus } from "./order";

export class ClientBalanceHistory extends Model{
  paymentEntity: Entity;
  orderEntity: Entity;
  transactionEntity: Entity;
  
  constructor(dbo: DB) {
    super(dbo, 'client_balance_history');
    this.orderEntity = new Entity(dbo, 'orders');
    this.transactionEntity = new Entity(dbo, 'transactions');
    this.paymentEntity = new Entity(dbo, 'client_payments');
  }

  updateAll(){
    const dt = moment().tz("America/Toronto").endOf('day').toDate().toISOString();
    const orderQuery = {delivered: { $lt: dt }, status: {$nin: [OrderStatus.BAD, OrderStatus.DELETED, OrderStatus.TEMP]}}; // , delivered: { $lt: moment().endOf('day').toDate() }};
    this.orderEntity.find(orderQuery).then(os => {
      this.transactionEntity.find({type: 'credit'}).then(ts => {
        this.find({}).then(cbs => {
          // 1. get all the clients
          const clients: any[] = [];
          ts.map((t:any) => {
            const client = clients.find(c => c.id === t.fromId);
            if (!client) {
              clients.push({ id: t.fromId, name: t.fromName });
            }
          });

          clients.map(c => {
            // 2. get debit and credit
            const orders = os.filter((order:any) => order.clientId === c.id);
            const transactions = ts.filter((t:any) => t.fromId === c.id);
            let list:any[] = [];
            let balance = 0;
            transactions.map((t:any) => {
              list.push({ date: t.created, type: 'credit', paid: t.amount, consumed: 0 });
            });

            orders.map((order:any) => {
              list.push({ date: order.delivered, type: 'debit', paid: 0, consumed: order.total });
            });

            list = list.sort((a: any, b: any) => {
              const aMoment = moment(a.date);
              const bMoment = moment(b.date);
              if (aMoment.isAfter(bMoment)) {
                return 1; // b at top
              } else if (bMoment.isAfter(aMoment)) {
                return -1;
              } else {
                if (a.type === 'debit' && b.type === 'credit') {
                  return -1;
                } else {
                  return 1;
                }
              }
            });

            // 3. get balance
            list.map(item => {
              if (item.type === 'debit') {
                balance -= item.consumed;
              } else if (item.type === 'credit') {
                balance += item.paid;
              }
            });

            // 4. update db if exist other wise create a new one
            const clientBalance = cbs.find((cb:any) => cb.clientId === c.id);
            if (clientBalance) {
              this.updateOne({ clientId: c.id }, { amount: balance, modified: new Date() }).then(()=>{});
            } else {
              const data: any = {
                clientId: c.id,
                clientName: c.name,
                amount: balance,
                created: new Date(),
                modified: new Date()
              };
              this.insertOne(data).then(() => {});
            }
          });
        });
      });
    });
  }
}
