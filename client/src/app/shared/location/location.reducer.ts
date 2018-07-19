import { ILocation } from './location.model';
import { LocationActions } from './location.actions';

export function locationReducer(state: ILocation, action: any) {
  switch (action.type) {
    case LocationActions.CLEAR:
      return null;
    case LocationActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
