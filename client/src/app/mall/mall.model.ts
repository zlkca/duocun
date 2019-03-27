export interface IEntityBase {
  id: string;
  name: string;
}

export interface IUserBase {
  id: string;
  username: string;
}

export interface IMall {
  id?: number;
  name: string;
  description?: string;
  type: string;
  lat: number;
  lng: number;
  radius?: number; // m
  restaurants?: IEntityBase[];
  workers?: IUserBase[];
  created?: Date;
  modified?: Date;
}

export class Mall implements IMall {
  id: number;
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
