export interface IPicture {
  name?: string;
  url: string;
  created?: Date;
  modified?: Date;
  id?: number;
  imageableId?: number;
  imageableType?: string;
  imageable?: any;
}

export class Picture implements IPicture {
  name: string;
  url: string;
  created: Date;
  modified: Date;
  id: number;
  imageableId: number;
  imageableType: string;
  imageable: any;
  constructor(data?: IPicture) {
    Object.assign(this, data);
  }
}
