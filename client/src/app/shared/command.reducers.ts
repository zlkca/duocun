import { CommandActions } from './command.actions';

export interface ICommandAction {
  type: string;
  payload: string;
}

export function commandReducer(state: string = '', action: ICommandAction) {
  if (action.payload) {
    switch (action.type) {
      case CommandActions.SEND:
        return action.payload;
    }
  }

  return state;
}
