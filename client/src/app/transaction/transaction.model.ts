
export interface ITransaction {
  _id?: string;
  id?: string;
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
  _id?: string;
  date: Date;
  received: number;
  paid: number;
  balance: number;
  type: string; // credit is from, debit is to
  id?: string;
  name?: string;
}
