import { AccountActions } from './account.actions';
import { Account } from './account.model';

export function accountReducer(state: Account = null, action: any) {

  const payload = action.payload;

  switch (action.type) {
    case AccountActions.UPDATE:
      // return payload;
      return {
        ...state,
        ...action.payload
      };
    case AccountActions.LOGOUT:
      return null;
    case AccountActions.CLEAR:
      return null;
  }

  return state;
}
