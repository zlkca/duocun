import { CommandActions } from './command.actions';

export interface ICommand {
  name: string;
  args: any;
}

export interface ICommandAction {
  type: string;
  payload: ICommand;
}

export function commandReducer(state: ICommand = { name: '', args: '' }, action: ICommandAction) {
  switch (action.type) {
    case CommandActions.SEND:
      return action.payload;
    case CommandActions.CLEAR_CMD:
      return { name: '', args: '' };
    default:
      return state;
  }
}
