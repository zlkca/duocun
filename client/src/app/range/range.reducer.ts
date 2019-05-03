import { IRange } from './range.model';
import { RangeActions } from './range.actions';

export interface IRangeAction {
  type: string;
  payload: IRange;
}

export function rangeReducer(state: IRange, action: IRangeAction) {
  switch (action.type) {
    case RangeActions.CLEAR:
      return null;
    case RangeActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
