import { Injectable } from '@angular/core';
import { Action } from 'redux';

export class LocationActions {
    static UPDATE_LOCATION = 'UPLOAD_LOCATION';
}

export class CartActions {
    static ADD_TO_CART = 'ADD_TO_CART';
    static REMOVE_FROM_CART = 'REMOVE_FROM_CART';
    static UPDATE_QUANTITY = 'UPDATE_QUANTITY';
    static CLEAR_CART = 'CLEAR_CART';
}

export class PictureActions {
    static ADD_PICTURE = 'ADD_PICTURE';
    static CHANGE_PICTURE = 'CHANGE_PICTURE';
    static REMOVE_PICTURE = 'REMOVE_PICTURE';
}

export interface ILocation {
    street: string;
    sub_locality: string;
    lat: number;
    lng: number;
}

export interface ICartItem {
    pid: string; // product id
    rid: string; // restaurant id
    name: string; // product name
    price: number;
    quantity: number;
}

export interface ICart {
    items: ICartItem[];
}

export interface IPicture {
    id: string;
    name: string;
    image: { data: any, file: any };
    description: string;
    index: number;
    width: number;
    height: number;
    product: { id: string };
    status: string;
}

export const DEFAULT_LOCATION = {
    street: '',
    sub_locality: 'Toronto',
    lat: 0,
    lng: 0
}

export const DEFAULT_PICTURE = {
    id: '',
    name: '',
    image: { data: '', file: '' },
    description: '',
    index: 0,
    width: 0,
    height: 0,
    product: { id: '' },
    status: ''
}
