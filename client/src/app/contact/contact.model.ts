import { IAccount } from '../account/account.model';
import { ILocation } from '../location/location.model';

export interface IContact {
  id?: string;
  accountId: string;
  account: IAccount;
  location: ILocation;
  address?: string;
  buzzCode: string;
  created?: Date;
  modified?: Date;
}

export class Contact implements IContact {
  id: string;
  accountId: string;
  account: IAccount;
  location: ILocation;
  address: string;
  buzzCode: string;
  created?: Date;
  modified?: Date;

  constructor(data?: IContact) {
    Object.assign(this, data);
  }
}
