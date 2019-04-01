import { ILocation } from './location.model';
import { LocationActions } from './location.actions';

export interface ILocationAction {
  type: string;
  payload: ILocation;
}

export function locationReducer(state: ILocation, action: ILocationAction) {
  switch (action.type) {
    case LocationActions.CLEAR:
      return null;
    case LocationActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
