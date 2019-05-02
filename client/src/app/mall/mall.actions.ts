import { IMall } from './mall.model';

export const DEFAULT_MALL: IMall = {
  id: '1',
  name: 'virtual Richmond Hill',
  // type: 'real',
  lat: 43.8461479,
  lng: -79.37935279999999,
  // radius: 8,
  workers: [{id: '5c9966b7fb86d40a4414eb79', username: 'worker'}]
};

export class MallActions {
  static UPDATE = 'UPDATE';
}

