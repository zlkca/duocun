import { IAccount } from '../account/account.model';
import { ILocation } from '../location/location.model';

export interface IContact {
  _id?: string;
  accountId?: string;
  username?: string;
  phone?: string;
  // account: IAccount;
  placeId?: string; // doesn't exist
  location?: ILocation; // in db
  address?: string;     // in db
  unit?: string;
  buzzCode?: string;
  verificationCode?: string; // in db
  created?: string;
  modified?: string;
  verified?: boolean;
}

export class Contact implements IContact {
  _id?: string;
  accountId: string;
  username: string;
  phone: string;
  // account: IAccount;
  unit: string;
  placeId: string; // doesn't exist
  location: ILocation;
  address: string;
  buzzCode: string;
  verificationCode: string;
  created?: string;
  modified?: string;
  verified?: boolean;

  constructor(data?: IContact) {
    Object.assign(this, data);
  }
}
