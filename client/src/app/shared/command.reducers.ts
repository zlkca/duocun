import { CommandActions } from './command.actions';

export interface ICommand {
  name: string;
  args: any;
}

export interface ICommandAction {
  type: string;
  payload: ICommand;
}

export function commandReducer(state: ICommand = {name: '', args: ''}, action: ICommandAction) {
  if (action.payload) {
    switch (action.type) {
      case CommandActions.SEND:
        return action.payload;
    }
  }

  return state;
}
