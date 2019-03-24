import { CommandActions } from './command.actions';

export interface ICommandAction {
  type: string;
  payload: any;
}

export function commandReducer(state: string = '', action: any) {
  if (action.payload) {
    switch (action.type) {
      case CommandActions.SEND:
        return action.payload;
    }
  }

  return state;
}
