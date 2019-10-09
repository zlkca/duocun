import { Collection, ObjectId, ObjectID, InsertWriteOpResult, MongoError, BulkWriteResult, BulkWriteOpResultObject, InsertOneWriteOpResult } from "mongodb";
import { DB } from "./db";
import { Db } from 'mongodb';

export interface IJoinParam {
  from: string,
  localField: string,
  foreignField: string,
  as: string
}

export class Entity {
  private db: Db;
  private collectionName: string;

  constructor(dbo: DB, name: string) {
    this.db = dbo.getDb();
    this.collectionName = name;
  }

  getCollection(): Promise<Collection> {
    if (this.db) {
      const collection: Collection = this.db.collection(this.collectionName);
      if (collection) {
        return new Promise((resolve, reject) => {
          resolve(collection);
        });
      } else {
        return this.db.createCollection(this.collectionName);
      }
    } else {
      return new Promise((resolve, reject) => {
        reject(null);
      });
    }
  }

  join(params: IJoinParam[], query: any = {}): Promise<any> {
    const q: any[] = [
      { $match: query }
    ];

    params.map(p => {
      q.push({ $lookup: p });
      q.push({ $unwind: '$'+p.as});
    });

    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.aggregate(q, (err, ret) => {
          ret.toArray().then(x => {
            resolve(x);
          });
        });
      });
    });
  }


  insertOne(doc: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.insertOne(doc).then((result: any) => { // InsertOneWriteOpResult
          const ret = (result.ops && result.ops.length > 0) ? result.ops[0] : null;
          if (ret && ret._id) {
            ret.id = ret._id;
            delete (ret._id);
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
          if (doc && doc._id) {
            doc.id = doc._id;
            delete (doc._id);
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
          if (doc && doc._id) {
            doc.id = doc._id;
            // delete (doc._id);
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
          arr.push({ _id: new ObjectID(id) });
        });

        query = { $or: arr };
      } else if (typeof body === "string") {
        query['_id'] = new ObjectID(query.id);
        delete query['id'];
      }
    }

    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        c.find(query, options).toArray((err, docs) => {
          let s: any[] = [];
          if (docs && docs.length > 0) {
            docs.map((v, i) => {
              if (v && v._id) {
                v.id = v._id;
                // delete (v._id);
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
        c.replaceOne(query, doc, options, (err, result: any) => {
          if (result && result._id) {
            result.id = result._id;
            delete (result._id);
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
        c.updateOne(query, { $set: doc }, options, (err, result: any) => {
          if (result && result._id) {
            result.id = result._id;
            delete (result._id);
          }
          resolve(result);
        });
      });
    });
  }

  bulkUpdateV1(items: any[], options?: any) {
    this.getCollection().then((c: Collection) => {
      items.map(item => {
        let query = item.query;
        let doc = item.data;
        if (query && query.hasOwnProperty('id')) {
          query['_id'] = new ObjectID(query.id);
          delete query['id'];
        }

        c.updateOne(query, { $set: doc }, options, (err, result: any) => {
          if (result && result._id) {
            result.id = result._id;
            delete (result._id);
          }
        });
      });
    });
  }

  bulkUpdate(items: any[], options?: any): Promise<BulkWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        const clonedArray: any[] = JSON.parse(JSON.stringify(items));
        const a: any[] = [];

        clonedArray.map(item => {
          let query = item.query;
          let doc = item.data;
          if (query && query.hasOwnProperty('id')) {
            query['_id'] = new ObjectID(query.id);
            delete query['id'];
          }

          if (doc && doc.hasOwnProperty('categoryId')) {
            const catId = doc['categoryId'];
            if (typeof catId === 'string' && catId.length === 24) {
              doc['categoryId'] = new ObjectID(catId);
            }
          }
          if (doc && doc.hasOwnProperty('merchantId')) {
            const merchantId = doc['merchantId'];
            if (typeof merchantId === 'string' && merchantId.length === 24) {
              doc['merchantId'] = new ObjectID(merchantId);
            }
          }
          a.push({ updateOne: { filter: query, update: { $set: doc }, upsert: true } });
        });

        c.bulkWrite(a, (err, result: BulkWriteOpResultObject) => {
          // if(result && result._id){
          //   result.id = result._id;
          //   delete(result._id);
          // }
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  bulkDelete(queries: any[], options?: any): Promise<BulkWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        const clonedArray: any[] = JSON.parse(JSON.stringify(queries));
        const a: any[] = [];

        clonedArray.map(query => {
          if (query && query.hasOwnProperty('id')) {
            query['_id'] = new ObjectID(query.id);
            delete query['id'];
          }
          a.push({ deleteOne: { filter: query } });
        });

        c.bulkWrite(a, (err: MongoError, result: BulkWriteOpResultObject) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });
  }

  replaceById(id: string, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.replaceOne({ _id: new ObjectId(id) }, doc, options, (err, result: any) => {
          if (result.ops) {
            let obj = result.ops[0]
            if (obj && obj._id) {
              obj.id = obj._id;
              // delete (obj._id);
            }
            resolve(obj);
          } else {
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
        c.deleteOne({ _id: new ObjectID(id) }, (err, doc) => { // DeleteWriteOpResultObject
          resolve(doc);
        });
      });
    });
  }

  insertMany(items: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.insertMany(items, {}, (err: MongoError, r: any) => { //InsertWriteOpResult
          if (!err) {
            const rs: any[] = [];
            r.ops.map((obj: any) => {
              if (obj && obj._id) {
                obj.id = obj._id;
                delete (obj._id);
                rs.push(obj);
              }
            });
            resolve(rs);
          } else {
            reject(err);
          }
        });
      });
    });
  }

  // deprecated
  deleteMany(query: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.deleteMany(query, options, (err, ret) => { // DeleteWriteOpResultObject
          resolve(ret); // ret.deletedCount
        });
      });
    });
  }
}