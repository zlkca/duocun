import { MallActions, DEFAULT_MALL } from './mall.actions';
import { IMall } from './mall.model';

export interface IMallAction {
  type: string;
  payload: IMall[];
}

export function mallReducer(state: IMall = DEFAULT_MALL, action: IMallAction) {
  if (action.payload) {
    switch (action.type) {
      case MallActions.UPDATE:
        return action.payload;
    }
  }

  return state;
}

