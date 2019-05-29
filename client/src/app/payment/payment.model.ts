
export interface IPayment {
  id?: string;
  clientId?: string;
  clientName?: string;
  driverId?: string;
  driverName?: string;
  credit?: number;
  debit?: number;
  balance?: number;
  created?: Date;
  modified?: Date;
}

export interface IBalance {
  id?: string;
  accountId: string;
  accountName: string;
  amount: number;
  created?: Date;
  modified?: Date;
}

export interface IClientPayment {
  id?: string;
  orderId?: string;
  merchantId?: string;
  merchantName?: string;
  clientId?: string;
  clientName?: string;
  driverId?: string;
  driverName?: string;
  type?: string; // debit credit
  amount?: number;
  note?: string;
  delivered?: Date;
  status?: string;
  created?: Date;
  modified?: Date;
}
