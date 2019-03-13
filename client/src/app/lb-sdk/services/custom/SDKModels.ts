/* tslint:disable */
import { Injectable } from '@angular/core';
import { Account } from '../../models/Account';
import { Container } from '../../models/Container';
import { Restaurant } from '../../models/Restaurant';
import { Category } from '../../models/Category';
import { Product } from '../../models/Product';
import { Order } from '../../models/Order';
import { OrderItem } from '../../models/OrderItem';
import { Picture } from '../../models/Picture';
import { Address } from '../../models/Address';
import { Location } from '../../models/Location';

export interface Models { [name: string]: any }

@Injectable()
export class SDKModels {

  private models: Models = {
    Account: Account,
    Container: Container,
    Restaurant: Restaurant,
    Category: Category,
    Product: Product,
    Order: Order,
    OrderItem: OrderItem,
    Picture: Picture,
    Address: Address,
    Location: Location,
    
  };

  public get(modelName: string): any {
    return this.models[modelName];
  }

  public getAll(): Models {
    return this.models;
  }

  public getModelNames(): string[] {
    return Object.keys(this.models);
  }
}
