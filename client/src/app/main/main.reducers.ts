import { PageActions, DeliverTimeActions } from './main.actions';

export interface IPageAction {
  type: string;
  payload: any;
}

export function pageReducer(state: string = 'home', action: IPageAction) {
  if (action.payload) {
    switch (action.type) {
      case PageActions.UPDATE_URL:
        return action.payload;
    }
  }

  return state;
}


export interface IDeliverTimeAction {
  type: string;
  payload: string;
}

export function deliverTimeReducer(state: string = 'immediate', action: IDeliverTimeAction) {
  if (action.payload) {
    switch (action.type) {
      case DeliverTimeActions.UPDATE:
        return action.payload;
    }
  }

  return state;
}
