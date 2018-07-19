/* tslint:disable */
import {
  Restaurant,
  Order,
  Address
} from '../index';

declare var Object: any;
export interface AccountInterface {
  "type": string;
  "realm"?: string;
  "username"?: string;
  "email": string;
  "emailVerified"?: boolean;
  "id"?: number;
  "password"?: string;
  accessTokens?: any[];
  restaurants?: Restaurant[];
  orders?: Order[];
  address?: Address;
}

export class Account implements AccountInterface {
  "type": string;
  "realm": string;
  "username": string;
  "email": string;
  "emailVerified": boolean;
  "id": number;
  "password": string;
  accessTokens: any[];
  restaurants: Restaurant[];
  orders: Order[];
  address: Address;
  constructor(data?: AccountInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Account`.
   */
  public static getModelName() {
    return "Account";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Account for dynamic purposes.
  **/
  public static factory(data: AccountInterface): Account{
    return new Account(data);
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
      name: 'Account',
      plural: 'Accounts',
      path: 'Accounts',
      idName: 'id',
      properties: {
        "type": {
          name: 'type',
          type: 'string',
          default: 'user'
        },
        "realm": {
          name: 'realm',
          type: 'string'
        },
        "username": {
          name: 'username',
          type: 'string'
        },
        "email": {
          name: 'email',
          type: 'string'
        },
        "emailVerified": {
          name: 'emailVerified',
          type: 'boolean'
        },
        "id": {
          name: 'id',
          type: 'number'
        },
        "password": {
          name: 'password',
          type: 'string'
        },
      },
      relations: {
        accessTokens: {
          name: 'accessTokens',
          type: 'any[]',
          model: '',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'userId'
        },
        restaurants: {
          name: 'restaurants',
          type: 'Restaurant[]',
          model: 'Restaurant',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'ownerId'
        },
        orders: {
          name: 'orders',
          type: 'Order[]',
          model: 'Order',
          relationType: 'hasMany',
                  keyFrom: 'id',
          keyTo: 'accountId'
        },
        address: {
          name: 'address',
          type: 'Address',
          model: 'Address',
          relationType: 'hasOne',
                  keyFrom: 'id',
          keyTo: 'entityId'
        },
      }
    }
  }
}
