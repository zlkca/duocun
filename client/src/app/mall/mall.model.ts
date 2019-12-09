import { IRange } from '../range/range.model';



export interface IRegionOpening {
  regionId?: string;
  regionName?: string;
  dow?: string[];
}

export interface IMall {
  _id?: string;
  name?: string;
  description?: string;
  // type?: string;
  placeId: string;
  lat?: number;
  lng?: number;
  // regionId?: string;
  // regionName?: string;
  // openings?: IRegionOpening[];
  // radius?: number; // m
  ranges?: string[];
  distance?: number; // Dynamic
  deliverFee?: number; // Dynamic
  fullDeliverFee?: number; // Dynamic
  created?: Date;
  modified?: Date;
}

// For Database
export class Mall implements IMall {
  _id: string;
  name: string;
  description?: string;
  // type: string;
  placeId: string;
  lat: number;
  lng: number;
  // regionId?: string;
  // regionName?: string;
  // openings?: IRegionOpening[];
  // radius: number; // m
  ranges?: string[];
  created?: Date;
  modified?: Date;

  constructor(data?: IMall) {
    Object.assign(this, data);
  }
}

