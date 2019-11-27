import { IContact } from './contact.model';
import { ContactActions } from './contact.actions';

export interface IContactAction {
  type: string;
  payload: IContact;
}

export function contactReducer(state: IContact, action: IContactAction) {
  const payload = action.payload;
  switch (action.type) {
    case ContactActions.CLEAR:
      return null;
    case ContactActions.LOAD_FROM_DB:
      return action.payload;

    case ContactActions.UPDATE_WITHOUT_LOCATION:
      return {
        ...state,
        accountId: payload.accountId,
        username: payload.username,
        phone: payload.phone,
        verificationCode: payload.verificationCode,
        verified: payload.verified
      };
    case ContactActions.UPDATE_LOCATION_WITH_ACCOUNT:
      return {
        ...state,
        accountId: action.payload.accountId,
        username: action.payload.username,
        placeId: action.payload.placeId,
        location: action.payload.location
      };
    case ContactActions.UPDATE_LOCATION:
      return {
        ...state,
        location: action.payload.location
      };
    case ContactActions.UPDATE_PHONE_NUM:
      return {
        ...state,
        phone: action.payload.phone,
        // verificationCode: action.payload.verificationCode
      };
    case ContactActions.UPDATE_ACCOUNT:
      return {
        ...state,
        accountId: action.payload.accountId,
        username: action.payload.username,
      };
    default:
      return state || null;
  }
}
