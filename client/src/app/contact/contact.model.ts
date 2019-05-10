import { IAccount } from '../account/account.model';
import { ILocation } from '../location/location.model';

export interface IContact {
  id?: string;
  accountId?: string;
  username?: string;
  phone?: string;
  // account: IAccount;
  placeId?: string;
  location?: ILocation;
  address?: string;
  unit?: string;
  buzzCode?: string;
  verificationCode?: string;
  created?: Date;
  modified?: Date;
}

export class Contact implements IContact {
  id: string;
  accountId: string;
  username: string;
  phone: string;
  // account: IAccount;
  unit: string;
  placeId: string;
  location: ILocation;
  address: string;
  buzzCode: string;
  verificationCode: string;
  created?: Date;
  modified?: Date;

  constructor(data?: IContact) {
    Object.assign(this, data);
  }
}
