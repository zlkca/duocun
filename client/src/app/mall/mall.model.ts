export interface IEntityBase {
  id?: string;
}

export interface IUserBase {
  id: string;
  username: string;
}

export interface IMall {
  id?: string;
  name: string;
  description?: string;
  type: string;
  lat: number;
  lng: number;
  radius?: number; // m
  restaurants?: IEntityBase[];
  workers?: IUserBase[];
  distance?: number; // Dynamic
  deliverFee?: number; // Dynamic
  fullDeliverFee?: number; // Dynamic
  created?: Date;
  modified?: Date;
}

// For Database
export class Mall implements IMall {
  id: string;
  name: string;
  description?: string;
  type: string;
  lat: number;
  lng: number;
  radius: number; // m
  restaurants: IEntityBase[];
  workers: IUserBase[];
  created?: Date;
  modified?: Date;

  constructor(data?: IMall) {
    Object.assign(this, data);
  }
}
