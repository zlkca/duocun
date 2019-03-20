import { Collection, ObjectId } from "mongodb";
import { DB } from "./db";

export class Entity {
  private db: any;
  private collectionName: string;

  constructor(dbo: DB, name: string) {
    this.db = dbo.getDb();
    this.collectionName = name;
  }

  getCollection(): Promise<Collection> {
    if(this.db){
      const collection: Collection = this.db.collection(this.collectionName);
      if (collection) {
        return new Promise((resolve, reject) => {
          resolve(collection);
        });
      } else {
        return this.db.createCollection(this.collectionName);
      }
    }else{
      return new Promise((resolve, reject) => {
        reject(null);
      });
    }
  }

  insertOne(doc: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.insertOne(doc).then((result: any) => {
          if(result && result._id){
            result.id = result._id;
            delete(result._id);
          }
          resolve(result);
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
          if(doc && doc._id){
            doc.id = doc._id;
            delete(doc._id);
          }
          resolve(doc);
        });
      });
    });
  }

  find(query: any, options?: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.find(query, options).toArray((err, docs) => {
          let s:any[] = [];
          docs.map((v, i) => {
            if(v && v._id){
              v.id = v._id;
              delete(v._id);
            }
            s.push(v);
          })
          resolve(s);
        });
      });
    });
  }

  replaceOne(query: any, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.replaceOne(query, doc, options, (err, result:any) => {
          if(result && result._id){
            result.id = result._id;
            delete(result._id);
          }
          resolve(result);
        });
      });
    });
  }

  replaceById(id: string, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.replaceOne({_id: new ObjectId(id)}, doc, options, (err, result: any) => {
          if(result && result._id){
            result.id = result._id;
            delete(result._id);
          }
          resolve(result);
        });
      });
    });
  }
}