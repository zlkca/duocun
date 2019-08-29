import { IMall } from './mall.model';

export const DEFAULT_MALL: IMall = {
  id: '1',
  name: 'virtual Richmond Hill',
  placeId: '',
  // type: 'real',
  lat: 43.8461479,
  lng: -79.37935279999999
};

export class MallActions {
  static UPDATE = 'UPDATE';
}

