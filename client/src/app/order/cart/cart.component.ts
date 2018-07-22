import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../store';
import { ICart, CartActions, ICartItem } from '../order.actions';
import { OrderService } from '../order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { AccountService } from '../../account/account.service';
import { Account, Order, OrderItem } from '../../shared/lb-sdk';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
    total = 0;
    subscription;
    subscriptionAccount;
    cart: any;
    user: Account;
    orderId: number;

    @ViewChild('orderDetailModal') orderDetailModal;

    constructor(
        private rx: NgRedux<IAppState>,
        private OrderServ: OrderService,
        private accountServ: AccountService,
        private modalServ: NgbModal
    ) {
    }

    ngOnInit() {
        this.subscription = this.rx.select<ICart>('cart').subscribe(
            cart => {
                this.total = 0;
                this.cart = cart;
                this.cart.items.map(x => {
                    this.total += x.price * x.quantity;
                });
            });

        this.subscriptionAccount = this.accountServ.getCurrent()
            .subscribe((acc: Account) => {
                console.log(acc);
                this.user = acc;
            });
    }

    addToCart(item: ICartItem) {
        this.rx.dispatch({
            type: CartActions.ADD_TO_CART,
            payload: { pid: item.pid, name: item.name, price: item.price, restaurant_id: item.rid }
        });
    }

    removeFromCart(item: ICartItem) {
        this.rx.dispatch({
            type: CartActions.REMOVE_FROM_CART,
            payload: { pid: item.pid, name: item.name, price: item.price, restaurant_id: item.rid }
        });
    }

    updateQuantity(item) {
        this.rx.dispatch({
            type: CartActions.UPDATE_QUANTITY,
            payload: { pid: item.pid, name: item.name, price: item.price, restaurant_id: item.rid, quantity: parseInt(item.quantity, 10) }
        });
    }

    checkout() {
        const orders = this.createOrders(this.cart);
        this.OrderServ.create(orders[0])
            .subscribe((newOrder: Order) => {
                this.orderId = newOrder.id;
                this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
                this.modalServ.open(this.orderDetailModal);
            });
    }

    clearCart() {
        this.rx.dispatch({ type: CartActions.CLEAR_CART, payload: {} });
    }

    createOrders(cart: any) {
        console.log(this.user);
        const restaurantSet = new Set(cart.items.map(x => x.restaurant_id));
        const restaurantIds = [...restaurantSet];
        const orders = [];

        for (const id of restaurantIds) {
            orders.push({ restaurantId: id, items: [], accountId: this.user.id });
        }

        for (const item of cart.items) {
            for (const order of orders) {
                if (item.restaurant_id === order.restaurantId) {
                    order.items.push({
                        price: item.price,
                        quantity: item.quantity,
                        productId: item.pid,
                    });
                }
            }
        }
        return orders;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.subscriptionAccount.unsubscribe();
    }





}
