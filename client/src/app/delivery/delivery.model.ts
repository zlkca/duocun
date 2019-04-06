import { IAccount } from '../account/account.model';
import { ILocation } from '../location/location.model';

export interface IDeliveryTime {
  type?: string;
  text?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface IDelivery {
  id?: string;
  accountId: string;
  account: IAccount;
  location: ILocation;
  address?: string;
  buzzCode?: string;
  timeType?: string;
  fee?: string;
  created?: Date;
  modified?: Date;
}

export class Delivery implements IDelivery {
  id: string;
  accountId: string;
  account: IAccount;
  location: ILocation;
  address: string;
  buzzCode: string;
  timeType?: string;
  fee?: string;
  created?: Date;
  modified?: Date;

  constructor(data?: IDelivery) {
    Object.assign(this, data);
  }
}
