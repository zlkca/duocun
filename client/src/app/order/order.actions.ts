import { Injectable } from '@angular/core';
import { Action } from 'redux';

export class CartActions {
    static ADD_TO_CART = 'ADD_TO_CART';
    static REMOVE_FROM_CART = 'REMOVE_FROM_CART';
    static UPDATE_QUANTITY = 'UPDATE_QUANTITY';
    static CLEAR_CART = 'CLEAR_CART';
}

export interface ICartItem {
    productId: string;
    restaurantId: string;
    name: string; // product name
    price: number;
    quantity: number;
}

export interface ICart {
    items: ICartItem[];
}
