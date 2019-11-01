import { IAccount } from '../account/account.model';
import { ILocation } from '../location/location.model';
import { IRange } from '../range/range.model';

export interface IDeliveryTime {
  text?: string;
  from?: Date;
  to?: Date;
}

export interface IDelivery {
  origin?: ILocation; // client location
  destination?: ILocation; // mall location
  availableRanges?: IRange[];
  distance?: number; // m
  date?: any; // moment object
  dateType?: string;
}

export class Delivery implements IDelivery {
  id?: string;
  origin: ILocation;
  destination: ILocation;
  availableRanges?: IRange[];
  distance: number; // m
  date?: any; // moment object
  created?: Date;
  modified?: Date;

  constructor(data?: IDelivery) {
    Object.assign(this, data);
  }
}
