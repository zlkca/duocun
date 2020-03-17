// import { Picture } from '../picture.model';
import {IProduct} from '../product/product.model';
import {ISpecification, ISpecificationDetail, Specification} from '../specification/specification.model';
import {CartService} from './cart.service';
import {IMerchant} from '../merchant/merchant.model';

export interface ICartItemSpecDetail extends ISpecificationDetail {
  quantity: number;
}


export class CartItemSpecDetail implements ICartItemSpecDetail {
  name: string;
  nameEN?: string;
  price: number;
  cost: number;
  quantity: number;
  constructor(obj: ISpecificationDetail) {
    Object.assign(this, obj);
    if (this.quantity === undefined) {
      this.quantity = 1;
    }
  }
  static fromRawData(obj: ISpecificationDetail): ISpecificationDetail {
    return new CartItemSpecDetail(obj);
  }
  equals(that: ISpecificationDetail) {
    return this.name === that.name &&
      this.nameEN === that.nameEN &&
      this.price === that.price &&
      this.cost === that.cost;
  }
  isTypeOf(type: ISpecificationDetail): boolean {
    return this.equals(type);
  }
  same(that: ICartItemSpecDetail): boolean {
    return this.equals(that) && this.quantity === that.quantity;
  }
  isEmpty(): boolean {
    return !this.quantity;
  }
  totalPrice(): number {
    return this.price * this.quantity;
  }
  totalCost(): number {
    return this.cost * this.quantity;
  }
}

export interface ICartItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<CartItemSpecDetail>;
}

export class CartItemSpec implements ICartItemSpec {
  specId: string;
  specName: string;
  type: 'single' | 'multiple';
  list: Array<CartItemSpecDetail>;
  constructor(obj: ICartItemSpec) {
    Object.assign(this, obj);
  }
  static fromRawData(obj): CartItemSpec {
    const instance = new CartItemSpec({
      specId: obj.specId,
      specName: obj.specName,
      type: obj.type,
      list: []
    });
    if (obj.list) {
      obj.list.forEach(data => {
        instance.list.push(new CartItemSpecDetail(data));
      });
    }
    return instance;
  }
  // calculations
  totalPrice(): number {
    if (this.type !== 'single') {
      let totalPrice = 0;
      this.list.forEach(itemSpecDetail => {
        totalPrice += itemSpecDetail.totalPrice();
      });
      return totalPrice;
    } else {
      return this.list[0] ? this.list[0].price : 0;
    }
  }
  totalCost(): number {
    if (this.type !== 'single') {
      let totalCost = 0;
      this.list.forEach(itemSpecDetail => {
        totalCost += itemSpecDetail.totalCost();
      })
      return totalCost;
    } else {
      return this.list[0] ? this.list[0].cost : 0;
    }
  }
  // quantity
  _addNewItem(specDetail: ISpecificationDetail, quantity: number = 1): void {
    if (specDetail instanceof CartItemSpecDetail) {
      specDetail.quantity = quantity;
      this.list.push(specDetail);
    } else {
      const itemSpecDetail = new CartItemSpecDetail(specDetail);
      itemSpecDetail.quantity = quantity;
      this.list.push(itemSpecDetail);
    }
  }
  _removeItemAt(index: number): void {
    this.list.splice(index, 1);
  }
  addItem(item: ISpecificationDetail): void {
    const itemSpecDetail = this.findByType(item);
    if (itemSpecDetail) {
      itemSpecDetail.quantity = itemSpecDetail.quantity + 1;
    } else {
      this._addNewItem(new CartItemSpecDetail(item));
    }
  }
  removeItem(item: ISpecificationDetail): void {
    const index = this.findIndexByType(item);
    if (index !== -1) {
      this._removeItemAt(index);
    }
  }
  setItemQuantity(item: ISpecificationDetail, quantity: number): void {
    const itemSpecDetail = this.findByType(item);
    if (this.type === 'single') {
      if (itemSpecDetail) {
        itemSpecDetail.quantity = 1;
        this.list = [itemSpecDetail];
      } else {
        this.list = [];
        this._addNewItem(new CartItemSpecDetail(item), quantity);
      }
    } else  {
      if (itemSpecDetail) {
        itemSpecDetail.quantity = quantity;
      } else {
        this._addNewItem(new CartItemSpecDetail(item), quantity);
      }
    }
  }
  // comparators
  isTypeOf(that: ISpecification): boolean {
    return this.specId === that._id && this.specName === that.name && this.type === that.type;
  }
  equals(that: ICartItemSpec): boolean {
    if (this.specId === that.specId && this.specName === that.specName
      && this.type === that.type && this.list.length === that.list.length) {
      for (let i = 0; i < this.list.length; i++) {
        if (!this.contains(that.list[i])) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  isEmpty(): boolean {
    return this.list.length === 0;
  }
  // find methods
  findByType(specDetail: ISpecificationDetail): CartItemSpecDetail|undefined {
    return this.list.find(itemSpecDetail => itemSpecDetail.isTypeOf(specDetail));
  }
  findIndexByType(specDetail: ISpecificationDetail): number {
    return this.list.findIndex(itemSpecDetail => itemSpecDetail.isTypeOf(specDetail));
  }
  findIndexByItem(specDetail: ICartItemSpecDetail): number {
    return this.list.findIndex((itemSpecDetail) => itemSpecDetail.equals(specDetail));
  }
  findByItem(specDetail: ICartItemSpecDetail): CartItemSpecDetail|undefined {
    return this.list.find((itemSpecDetail) => itemSpecDetail.equals(specDetail));
  }
  containsType(specDetail: ISpecificationDetail): boolean {
    return this.findIndexByType(specDetail) !== -1;
  }
  contains(specDetail: ICartItemSpecDetail): boolean {
    return this.findIndexByItem(specDetail) !== -1;
  }

}

export interface ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  cost: number;
  quantity: number;
  spec?: Array<ICartItemSpec>;
}

export class CartItem implements ICartItem {
  productId: string;
  productName: string; // product name
  // pictures: Picture[];
  merchantId: string;
  merchantName: string;
  price: number;
  cost: number;
  quantity: number;
  spec?: Array<CartItemSpec>;
  constructor(obj: ICartItem) {
    Object.assign(this, obj);
  }
  static fromRawData(obj): CartItem {
    const instance = new CartItem({
      productId: obj.productId,
      productName: obj.productName,
      merchantId: obj.merchantId,
      merchantName: obj.merchantName,
      price: obj.price,
      cost: obj.cost,
      quantity: obj.quantity
    });
    if (obj.spec) {
      instance.spec = [];
      obj.spec.forEach(data => {
        instance.spec.push(CartItemSpec.fromRawData(data));
      });
    }
    return instance;
  }
  static getDefault(p: IProduct, restaurant: IMerchant): CartItem {
    const cartItem = new CartItem({
      productId: p._id,
      productName: p.name,
      merchantId: restaurant._id,
      merchantName: restaurant.name,
      price: p.price,
      cost: p.cost,
      quantity: 1
    });
    if (!p.specifications) {
      return cartItem;
    }
    cartItem.spec = [];
    p.specifications.forEach(spec => {
      const specDetail = Specification.getDefaultDetail(spec);
      if (specDetail) {
        cartItem.addItem(spec, specDetail);
      }
    });
    return cartItem;
  }
  // calculations
  costIncSpec(): number {
    let totalCost = this.cost;
    if (this.spec) {
      this.spec.forEach(spec => {
        totalCost += spec.totalCost();
      });
    }
    return totalCost;
  }
  priceIncSpec(): number {
    let totalPrice = this.price;
    if (this.spec) {
      this.spec.forEach(spec => {
        totalPrice += spec.totalPrice();
      });
    }
    return totalPrice;
  }
  priceAndCostIncSpec(): {price: number, cost: number} {
    const data = {
      price: this.price,
      cost: this.cost
    };
    if (this.spec) {
      this.spec.forEach(spec => {
        data.price += spec.totalPrice();
        data.cost += spec.totalCost();
      });
    }
    return data;
  }
  totalPrice(): number {
    return this.priceIncSpec() * this.quantity;
  }
  totalCost(): number {
    return this.costIncSpec() * this.quantity;
  }
  // find methods
  findIndexByType(type: ISpecification): number {
    if (this.spec && this.spec.length) {
      return this.spec.findIndex(itemSpec => itemSpec.isTypeOf(type));
    }
    return -1;
  }
  findByType(type: ISpecification): CartItemSpec|undefined {
    if (this.spec && this.spec.length) {
      return this.spec.find(itemSpec => itemSpec.isTypeOf(type));
    }
    return undefined;
  }
  findIndexByItem(spec: ICartItemSpec): number {
    if (this.spec && this.spec.length) {
      return this.spec.findIndex(itemSpec => itemSpec.equals(spec));
    }
    return -1;
  }
  findByItem(spec: ICartItemSpec): CartItemSpec|undefined {
    if (this.spec && this.spec.length) {
      return this.spec.find(itemSpec => itemSpec.equals(spec));
    }
    return undefined;
  }
  findNestedItemByTypes(spec: ISpecification, specDetail: ISpecificationDetail): CartItemSpecDetail|undefined {
    const matchedItem = this.findByType(spec);
    if (matchedItem) {
      return matchedItem.findByType(specDetail);
    }
    return undefined;
  }

  containsType(type: ISpecification): boolean {
    return this.findIndexByType(type) !== -1;
  }
  contains(spec: ICartItemSpec): boolean {
    return this.findIndexByItem(spec) !== -1;
  }
  // comparators
  isTypeOf(type: IProduct): boolean {
    return this.productId === type._id  && this.productName === type.name;
  }
  equals(that: ICartItem): boolean {
    if (this.productId === that.productId
      && this.productName === that.productName && this.merchantId === that.merchantId
      && this.merchantName === that.merchantName && this.price === that.price ) {
      if (this.spec === that.spec) {
        return true;
      }
      if ((!this.spec || this.spec.length) === 0 && (!that.spec || that.spec.length === 0)) {
        return true;
      }
      if (this.spec.length !== that.spec.length) {
        return false;
      }
      for (let i = 0; i < this.spec.length; i++) {
        if (!(this.contains(that.spec[i]))) {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }
  isEmpty(): boolean {
    return this.quantity < 1;
  }
  // details & descriptions
  singleSpecDetails(): Array<ICartItemSpecDetail> {
    const details = [];
    if (this.spec) {
      this.spec.forEach(spec => {
        if (spec.type === 'single' && spec.list && spec.list.length) {
          details.push(spec.list[0]);
        }
      });
    }
    return details;
  }
  multipleSpecDetails(): Array<ICartItemSpecDetail> {
    const details = [];
    if (this.spec) {
      this.spec.forEach(spec => {
        if (spec.type === 'multiple' && spec.list && spec.list.length) {
          spec.list.forEach(detail => {
            details.push(detail);
          });
        }
      });
    }
    return details;
  }
  singleSpecDesc(local: string = 'en', glue: string = ' '): string {
    const singles = [];
    if (this.spec) {
      const singleSpecs = this.spec.filter(spec => spec.type === 'single');
      singleSpecs.forEach(spec => {
        if (spec.list && spec.list.length) {
          const detail = spec.list[0];
          let detailName = '';
          if (local === 'en') {
            detailName =  detail.nameEN || detail.name;
          } else {
            detailName =  detail.name;
          }
          singles.push(detailName);
        }
      });
    }
    return singles.join(glue);
  }
  multipleSpecDesc(local: string = 'en'): Array<{name: string, quantity: number}> {
    const multiples = [];
    if (this.spec) {
      const multipleSpecs = this.spec.filter(spec => spec.type === 'multiple');
      multipleSpecs.forEach(spec => {
        if (spec.list) {
          spec.list.forEach(detail => {
            let detailName = detail.name;
            if (local === 'en' && detail.nameEN) {
              detailName = detail.nameEN;
            }
            multiples.push({
              name: detailName,
              quantity: detail.quantity
            });
          });
        }
      });
    }
    return multiples;
  }
  // quantity
  _addNewItem(spec: ICartItemSpec): void {
    if (!this.spec) {
      this.spec = [];
    }
    if (spec instanceof CartItemSpec) {
      this.spec.push(spec);
    } else {
      const itemSpec = new CartItemSpec(spec);
      this.spec.push(itemSpec);
    }
  }
  _removeItemAt(index): void {
    this.spec.splice(index, 1);
  }
  addItem(spec: ISpecification, specDetail: ISpecificationDetail): void {
    let itemSpec = this.findByType(spec);
    if (itemSpec) {
      itemSpec.addItem(specDetail);
    } else {
      itemSpec = new CartItemSpec({
        specId: spec._id,
        specName: spec.name,
        type: spec.type,
        list: [
          new CartItemSpecDetail(specDetail)
        ]
      });
      this._addNewItem(itemSpec);
    }
  }
  removeItem(spec: ISpecification, specDetail: ISpecificationDetail): void {
    const index = this.findIndexByType(spec);
    if (index !== -1) {
      const itemSpec = this.spec[index];
      itemSpec.removeItem(specDetail);
      if (itemSpec.isEmpty()) {
        this._removeItemAt(index);
      }
    }
  }
  setItemQuantity(spec: ISpecification, specDetail: ISpecificationDetail, quantity: number): void {
    let itemSpec = this.findByType(spec);
    if (itemSpec) {
      itemSpec.setItemQuantity(specDetail, quantity);
    } else {
      const itemSpecDetail = new CartItemSpecDetail(specDetail);
      itemSpecDetail.quantity = quantity;
      itemSpec = new CartItemSpec({
        specId: spec._id,
        specName: spec.name,
        type: spec.type,
        list: [
          itemSpecDetail
        ]
      });
      this._addNewItem(itemSpec);
    }
  }
}

export interface ICart {
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId: string;
  merchantName?: string;
  price?: number;
  quantity?: number;
  selectedCartItem?: CartItem; // selected product for specification
  items: CartItem[];
}
export class Cart implements ICart {
  clientId?: string;
  clientName?: string;
  clientPhoneNumber?: string;
  merchantId: string;
  merchantName?: string;
  price?: number;
  cost?: number;
  quantity?: number;
  selectedProduct?: IProduct; // selected product for specification
  selectedCartItem?: CartItem; // selected cart item for specification
  items: CartItem[];
  constructor(obj: ICart) {
    if (obj === null) {
      Object.assign(CartService.DEFAULT_CART);
    } else {
      Object.assign(this, obj);
    }
  }
  private _addNewItem(item: ICartItem, quantity: number = 1): void {
    item.quantity = quantity;
    if (item instanceof CartItem) {
      if (this.items.length === 0) {
        this.merchantId = item.merchantId;
        this.merchantName = item.merchantName;
        this.items.push(item);
      } else {
        if (this.merchantName !== item.merchantName || this.merchantId !== item.merchantId) {
          console.log(this, item);
          throw new Error('Cannot add an item of different merchant.');
        } else {
          this.items.push(item);
        }
      }
    } else {
      this._addNewItem(new CartItem(item), quantity);
    }
  }
  private _removeItemAt(index): void {
    this.items.splice(index, 1);
  }
  findIndexByItem(item: ICartItem): number {
    return this.items.findIndex(cartItem => cartItem.equals(item));
  }
  findByItem(item: ICartItem): CartItem|undefined {
    return this.items.find(cartItem => cartItem.equals(item));
  }
  filterByType(type: IProduct): Array<CartItem> {
    return this.items.filter(cartItem => cartItem.isTypeOf(type));
  }
  getNonDefaultCartItems(p: IProduct, restaurant: IMerchant) {
    const defaultCartItem = CartItem.getDefault(p, restaurant);
    return this.items.filter(cartItem => cartItem.isTypeOf(p)).filter(cartItem => !(cartItem.equals(defaultCartItem)));
  }
  getItemQuantity(item: ICartItem): number {
    const cartItem = this.findByItem(item);
    return cartItem ? cartItem.quantity : 0;
  }
  contains(item: CartItem): boolean {
    return this.findIndexByItem(item) !== -1;
  }
  addItem(item: ICartItem): void {
    let cartItem = this.findByItem(item);
    if (!cartItem) {
      cartItem = new CartItem(item);
      cartItem.quantity = 1;
      this._addNewItem(cartItem);
    } else {
      cartItem.quantity += 1;
    }
    this.update();
  }
  removeItem(item: ICartItem): void {
    const index = this.findIndexByItem(item);
    if (index !== -1) {
      this._removeItemAt(index);
    }
    this.update();
  }
  setItemQuantity(item: ICartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item);
    } else {
      const cartItem = this.findByItem(item);
      if (cartItem) {
        cartItem.quantity = Number.isSafeInteger(quantity) ? quantity : parseInt(`${quantity}`, 10); // LOL
      } else {
        this._addNewItem(new CartItem(item), quantity);
      }
    }
    this.update();
  }
  upItemQuantity(item: ICartItem): void {
    const cartItem = this.findByItem(item);
    if (cartItem) {
      cartItem.quantity = cartItem.quantity + 1;
    } else {
      this._addNewItem(item);
    }
    this.update();
  }
  downItemQuantity(item: ICartItem): void {
    const cartItemIndex = this.findIndexByItem(item);
    if (cartItemIndex === -1) {
      return;
    } else {
      const cartItem = this.items[cartItemIndex];
      if (cartItem.quantity > 1) {
        cartItem.quantity = cartItem.quantity - 1;
      } else {
        this._removeItemAt(cartItemIndex);
      }
    }
    this.update();
  }
  // this method can be private, but in case you're unsure of cart state
  // just call it
  update() {
    let price = 0;
    let cost = 0;
    let quantity = 0;
    this.items.forEach(item => {
      price += item.totalPrice();
      cost += item.totalCost();
      quantity += item.quantity;
    });
    this.price = price;
    this.cost = cost;
    this.quantity = quantity;
    if ( this.quantity <= 0 ) {
      Object.assign(this, CartService.DEFAULT_CART);
    }
  }
}
