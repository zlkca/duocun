/* tslint:disable */
import {
  GeoPoint
} from '../index';

declare var Object: any;
export interface AddressInterface {
  "formattedAddress": string;
  "location"?: GeoPoint;
  "sublocality"?: string;
  "city"?: string;
  "province"?: string;
  "country"?: string;
  "postalCode"?: string;
  "created"?: Date;
  "modified"?: Date;
  "id"?: number;
  "entityId"?: number;
  "entityType"?: string;
  entity?: any;
}

export class Address implements AddressInterface {
  "formattedAddress": string;
  "location": GeoPoint;
  "sublocality": string;
  "city": string;
  "province": string;
  "country": string;
  "postalCode": string;
  "created": Date;
  "modified": Date;
  "id": number;
  "entityId": number;
  "entityType": string;
  entity: any;
  constructor(data?: AddressInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Address`.
   */
  public static getModelName() {
    return "Address";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Address for dynamic purposes.
  **/
  public static factory(data: AddressInterface): Address{
    return new Address(data);
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
      name: 'Address',
      plural: 'Addresses',
      path: 'Addresses',
      idName: 'id',
      properties: {
        "formattedAddress": {
          name: 'formattedAddress',
          type: 'string'
        },
        "location": {
          name: 'location',
          type: 'GeoPoint'
        },
        "sublocality": {
          name: 'sublocality',
          type: 'string'
        },
        "city": {
          name: 'city',
          type: 'string'
        },
        "province": {
          name: 'province',
          type: 'string'
        },
        "country": {
          name: 'country',
          type: 'string'
        },
        "postalCode": {
          name: 'postalCode',
          type: 'string'
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
        "entityId": {
          name: 'entityId',
          type: 'number'
        },
        "entityType": {
          name: 'entityType',
          type: 'string'
        },
      },
      relations: {
        entity: {
          name: 'entity',
          type: 'any',
          model: '',
          relationType: 'belongsTo',
                  keyFrom: 'entityId',
          keyTo: 'id'
        },
      }
    }
  }
}
