
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
