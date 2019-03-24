import { PageActions } from './page.actions';

export interface IPageAction {
  type: string;
  payload: any;
}

export function pageReducer(state: string = 'home', action: any) {
  if (action.payload) {
    switch (action.type) {
      case PageActions.UPDATE_URL:
        return action.payload;
    }
  }

  return state;
}
