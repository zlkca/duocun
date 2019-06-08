import { Collection, ObjectId, ObjectID } from "mongodb";
import { DB } from "./db";
import { Db } from 'mongodb';

export class Entity {
  private db: Db;
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
          const ret = (result.ops && result.ops.length) ? result.ops[0] : null;
          if(ret && ret._id){
            ret.id = ret._id;
            delete(ret._id);
          }
          resolve(ret);
        }, err => {
          reject(err);
        });
      });
    });
  }

  distinct(key: string, query: any, options?: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.distinct(key, query, options, (err, doc) => {
          if(doc && doc._id){
            doc.id = doc._id;
            delete(doc._id);
          }
          resolve(doc);
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
    if (query && query.hasOwnProperty('id')) {
      let body = query.id;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push({_id: new ObjectID(id)});
        });

        query = { $or: arr };
      } else if(typeof body === "string"){
        query['_id'] = new ObjectID(query.id);
        delete query['id'];
      }
    }

    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.find(query, options).toArray((err, docs) => {
          let s:any[] = [];
          if(docs && docs.length > 0){
            docs.map((v, i) => {
              if(v && v._id){
                v.id = v._id;
                delete(v._id);
              }
              s.push(v);
            });
          }
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

  updateOne(query: any, doc: any, options?: any): Promise<any> {
    if (query && query.hasOwnProperty('id')) {
      query['_id'] = new ObjectID(query.id);
      delete query['id'];
    }
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.updateOne(query, {$set: doc}, options, (err, result:any) => {
          if(result && result._id){
            result.id = result._id;
            delete(result._id);
          }
          resolve(result);
        });
      });
    });
  }

  bulkUpdate(items: any[], options?: any){
    this.getCollection().then((c: Collection) => {
      items.map(item => {
        let query = item.query;
        let doc = item.data;
        if (query && query.hasOwnProperty('id')) {
          query['_id'] = new ObjectID(query.id);
          delete query['id'];
        }

        c.updateOne(query, {$set: doc}, options, (err, result:any) => {
          if(result && result._id){
            result.id = result._id;
            delete(result._id);
          }
        });
      });
    });
  }


  replaceById(id: string, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.replaceOne({_id: new ObjectId(id)}, doc, options, (err, result: any) => {
          if(result.ops){
            let obj = result.ops[0]
            if(obj && obj._id){
              obj.id = obj._id;
              delete(obj._id);
            }
            resolve(obj);
          }else{
            console.log('replaceById failed.');
            reject();
          }
        });
      });
    });
  }

  deleteById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.deleteOne({_id: new ObjectID(id)}, (err, doc) => {
          resolve(doc);
        });
      });
    });
  }

  insertMany(items: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.insertMany(items, {}, (err, docs) => {
          resolve(docs);
        });
      });
    });
  }

  deleteMany(query: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.deleteMany(query, options, (err, ret) => {
          resolve(ret);
        });
      });
    });
  }
}