import { IContact } from './contact.model';
import { ContactActions } from './contact.actions';

export interface IContactAction {
  type: string;
  payload: IContact;
}

export function contactReducer(state: IContact, action: IContactAction) {
  switch (action.type) {
    case ContactActions.CLEAR:
      return null;
    case ContactActions.LOAD_FROM_DB:
      return action.payload;

    case ContactActions.UPDATE_WITHOUT_LOCATION:
      return {
        ...state,
        accountId: action.payload.accountId,
        username: action.payload.username,
        phone: action.payload.phone,
        verificationCode: action.payload.verificationCode
      };
      case ContactActions.UPDATE_WITHOUT_LOCATION:
      return {
        ...state,
        phone: action.payload.phone,
        // verificationCode: action.payload.verificationCode
      };
    default:
      return state || null;
  }
}
