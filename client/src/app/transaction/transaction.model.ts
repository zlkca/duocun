
export interface ITransaction {
  id?: string;
  orderId?: string;
  fromId?: string;
  fromName?: string;
  toId?: string;
  toName?: string;
  type: string;
  amount: number;
  note?: string;
  created?: Date;
  modified?: Date;
}

export interface ITransactionData {
  date: Date;
  received: number;
  paid: number;
  balance: number;
  type: string; // credit is from, debit is to
  id?: string;
  name?: string;
}
