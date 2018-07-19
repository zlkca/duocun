import { CartActions, ICart, ICartItem } from './order.actions';


export interface ICartAction {
    type: string;
    payload: any;
}

export function cartReducer(state: ICart = { items: [] }, action: any) {
    if (action.payload) {
        let pid = action.payload.pid;
        let payload = action.payload;
        let item = state.items.find(x => x.pid == payload.pid);

        switch (action.type) {
            case CartActions.ADD_TO_CART:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = x.quantity + 1;
                        }
                        return x;
                    });

                    return { ...state, items: newItems }
                } else {
                    return {
                        ...state,
                        items: [...state.items, { ...action.payload, 'quantity': 1 }]
                    }
                }
            case CartActions.REMOVE_FROM_CART:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = x.quantity - 1;
                        }
                        return x;
                    });

                    return { ...state, items: newItems.filter(x => x.quantity > 0) }
                } else {
                    return state;
                }
            case CartActions.UPDATE_QUANTITY:
                if (item) {
                    let newItems = state.items.map(x => {
                        if (x.pid == payload.pid) {
                            x.quantity = payload.quantity;
                        }
                        return x;
                    });

                    return { ...state, items: newItems.filter(x => x.quantity > 0) }
                } else {
                    return state;
                }
            case CartActions.CLEAR_CART:
                return { ...state, items: [] }
        }
    }

    return state;
}
