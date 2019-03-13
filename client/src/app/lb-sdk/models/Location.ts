/* tslint:disable */
import {
  GeoPoint
} from '..';

declare var Object: any;
export interface LocationInterface {
  "formattedAddress": string;
  "unit"?: number;
  "streetName"?: string;
  "streetNumber"?: string;
  "location"?: GeoPoint;
  "sublocality"?: string;
  "city"?: string;
  "province"?: string;
  "country"?: string;
  "postalCode"?: string;
  "id"?: number;
}

export class Location implements LocationInterface {
  "formattedAddress": string;
  "unit": number;
  "streetName": string;
  "streetNumber": string;
  "location": GeoPoint;
  "sublocality": string;
  "city": string;
  "province": string;
  "country": string;
  "postalCode": string;
  "id": number;
  constructor(data?: LocationInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Location`.
   */
  public static getModelName() {
    return "Location";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Location for dynamic purposes.
  **/
  public static factory(data: LocationInterface): Location{
    return new Location(data);
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
      name: 'Location',
      plural: 'Locations',
      path: 'Locations',
      idName: 'id',
      properties: {
        "formattedAddress": {
          name: 'formattedAddress',
          type: 'string'
        },
        "unit": {
          name: 'unit',
          type: 'number'
        },
        "streetName": {
          name: 'streetName',
          type: 'string'
        },
        "streetNumber": {
          name: 'streetNumber',
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
        "id": {
          name: 'id',
          type: 'number'
        },
      },
      relations: {
      }
    }
  }
}
