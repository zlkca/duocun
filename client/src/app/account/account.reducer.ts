import { AccountActions } from './account.actions';
import { Account } from '../lb-sdk';


export const DEFAULT_ACCOUNT = new Account();

export function accountReducer(state: Account = DEFAULT_ACCOUNT, action: any) {
    if (action.payload) {
        const payload = action.payload;

        switch (action.type) {
            case AccountActions.UPDATE:
                return payload;
        }
    }

    return state;
}
