import { Collection } from "mongodb";
import { DB } from "./db";

export class Entity {
  private db: any;
  private collectionName: string;

  constructor(dbo: DB, name: string) {
    this.db = dbo.getDb();
    this.collectionName = name;
  }

  getCollection(): Promise<Collection> {
    const collection: Collection = this.db.collection(this.collectionName);
    if (collection) {
      return new Promise((resolve, reject) => {
        resolve(collection);
      });
    } else {
      return this.db.createCollection(this.collectionName);
    }
  }

  insertOne(doc: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.insertOne(doc).then((x: any) => {
          resolve(x);
        }, err => {
          reject(err);
        });
      });
    });
  }

  findOne(query: any, options?: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.findOne(query, options, (err, doc) => {
          resolve(doc);
        });
      });
    });
  }

  replaceOne(query: any, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.replaceOne(query, doc, options, (x: any) => {
          resolve(x);
        });
      });
    });
  }
}