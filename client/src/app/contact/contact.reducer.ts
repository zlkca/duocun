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
    case ContactActions.UPDATE:
      return action.payload;
    default:
      return state || null;
  }
}
