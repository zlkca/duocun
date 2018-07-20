/* tslint:disable */
import {
  Restaurant,
  Picture
} from '..';

declare var Object: any;
export interface ProductInterface {
  "name": string;
  "description"?: string;
  "price": number;
  "restaurantId": number;
  "created"?: Date;
  "modified"?: Date;
  "id"?: number;
  owner?: Restaurant;
  pictures?: Picture[];
}

export class Product implements ProductInterface {
  "name": string;
  "description": string;
  "price": number;
  "restaurantId": number;
  "created": Date;
  "modified": Date;
  "id": number;
  owner: Restaurant;
  pictures: Picture[];
  constructor(data?: ProductInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Product`.
   */
  public static getModelName() {
    return "Product";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Product for dynamic purposes.
  **/
  public static factory(data: ProductInterface): Product{
    return new Product(data);
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
      name: 'Product',
      plural: 'Products',
      path: 'Products',
      idName: 'id',
      properties: {
        "name": {
          name: 'name',
          type: 'string'
        },
        "description": {
          name: 'description',
          type: 'string'
        },
        "price": {
          name: 'price',
          type: 'number',
          default: 0
        },
        "restaurantId": {
          name: 'restaurantId',
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
        owner: {
          name: 'owner',
          type: 'Restaurant',
          model: 'Restaurant',
          relationType: 'belongsTo',
                  keyFrom: 'restaurantId',
          keyTo: 'id'
        },
        pictures: {
          name: 'pictures',
          type: 'Picture[]',
          model: 'Picture',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'imageableId'
        },
      }
    }
  }
}
