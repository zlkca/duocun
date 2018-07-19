/* tslint:disable */
import {
  Order,
  Product
} from '../index';

declare var Object: any;
export interface OrderItemInterface {
  "price": number;
  "quantity": number;
  "orderId": number;
  "productId": number;
  "created"?: Date;
  "modified"?: Date;
  "id"?: number;
  order?: Order;
  product?: Product;
}

export class OrderItem implements OrderItemInterface {
  "price": number;
  "quantity": number;
  "orderId": number;
  "productId": number;
  "created": Date;
  "modified": Date;
  "id": number;
  order: Order;
  product: Product;
  constructor(data?: OrderItemInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `OrderItem`.
   */
  public static getModelName() {
    return "OrderItem";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of OrderItem for dynamic purposes.
  **/
  public static factory(data: OrderItemInterface): OrderItem{
    return new OrderItem(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'OrderItem',
      plural: 'OrderItems',
      path: 'OrderItems',
      idName: 'id',
      properties: {
        "price": {
          name: 'price',
          type: 'number',
          default: 0
        },
        "quantity": {
          name: 'quantity',
          type: 'number'
        },
        "orderId": {
          name: 'orderId',
          type: 'number'
        },
        "productId": {
          name: 'productId',
          type: 'number'
        },
        "created": {
          name: 'created',
          type: 'Date'
        },
        "modified": {
          name: 'modified',
          type: 'Date'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
        order: {
          name: 'order',
          type: 'Order',
          model: 'Order',
          relationType: 'belongsTo',
                  keyFrom: 'orderId',
          keyTo: 'id'
        },
        product: {
          name: 'product',
          type: 'Product',
          model: 'Product',
          relationType: 'belongsTo',
                  keyFrom: 'productId',
          keyTo: 'id'
        },
      }
    }
  }
}
