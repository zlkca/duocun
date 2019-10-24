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

  join(params: any[], query: any = {}): Promise<any> {
    const q: any[] = Object.keys(query).length === 0 && query.constructor === Object ? [] : [
      { $match: query }
    ];

    params.map(p => {
      q.push(p);
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

  load(query: any, params?: any): Promise<any> {
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
        this.join(params, query).then((rs: any) => {
          resolve(rs);
        });
      });
    });
  }
  
  insertOne(doc: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {

        doc = this.convertIdFields(doc);
        c.insertOne(doc).then((result: any) => { // InsertOneWriteOpResult
          const ret = (result.ops && result.ops.length > 0) ? result.ops[0] : null;
          if (ret && ret._id) {
            ret.id = ret._id;
            // delete (ret._id);
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
        query = this.convertIdFields(query);
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
        query = this.convertIdFields(query);
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

  // quick find
  find(query: any, options?: any): Promise<any> {
    const self = this;    
    query = this.convertIdFields(query);

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

  // deprecated
  replaceOne(query: any, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        query = this.convertIdFields(query);
        doc = this.convertIdFields(doc);
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
    query = this.convertIdFields(query);
    doc = this.convertIdFields(doc);

    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.updateOne(query, { $set: doc }, options, (err, result: any) => { // {n: 1, nModified: 0, ok: 1}

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

  // only support query _id, not id
  convertIdFields(doc: any){
    if(doc && doc.hasOwnProperty('_id')) {
      let body = doc._id;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push({ _id: new ObjectID(id) });
        });

        doc = { $or: arr };
      } else if (typeof body === "string") {
        doc['_id'] = new ObjectID(doc._id);
      }
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

    if (doc && doc.hasOwnProperty('clientId')) {
      const clientId = doc['clientId'];
      if (typeof clientId === 'string' && clientId.length === 24) {
        doc['clientId'] = new ObjectID(clientId);
      } else if (clientId && clientId.hasOwnProperty('$in')) {
        let a = clientId['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push(new ObjectID(id));
        });
        doc.clientId = { $in: arr };
      }
    }

    if (doc && doc.hasOwnProperty('mallId')) {
      const mallId = doc['mallId'];
      if (typeof mallId === 'string' && mallId.length === 24) {
        doc['mallId'] = new ObjectID(mallId);
      }
    }

    if (doc && doc.hasOwnProperty('accountId')) {
      const accountId = doc['accountId'];
      if (typeof accountId === 'string' && accountId.length === 24) {
        doc['accountId'] = new ObjectID(accountId);
      }else if (accountId && accountId.hasOwnProperty('$in')) {
        let a = accountId['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push(new ObjectID(id));
        });
        doc.accountId = { $in: arr };
      }
    }

    if (doc && doc.hasOwnProperty('orderId')) {
      const orderId = doc['orderId'];
      if (typeof orderId === 'string' && orderId.length === 24) {
        doc['orderId'] = new ObjectID(orderId);
      }
    }
    
    if (doc && doc.hasOwnProperty('driverId')) {
      const driverId = doc['driverId'];
      if (typeof driverId === 'string' && driverId.length === 24) {
        doc['driverId'] = new ObjectID(driverId);
      }
    }

    if (doc && doc.hasOwnProperty('fromId')) {
      const fromId = doc['fromId'];
      if (typeof fromId === 'string' && fromId.length === 24) {
        doc['fromId'] = new ObjectID(fromId);
      }
    }

    if (doc && doc.hasOwnProperty('toId')) {
      const toId = doc['toId'];
      if (typeof toId === 'string' && toId.length === 24) {
        doc['toId'] = new ObjectID(toId);
      }
    }

    if(doc && doc.hasOwnProperty('$or')) {
      const items: any[] = [];
      doc['$or'].map((it: any) => {
        if (it && it.hasOwnProperty('toId')){
          items.push({toId: new ObjectID(it.toId)});
        }else if(it && it.hasOwnProperty('fromId')){
          items.push({fromId: new ObjectID(it.fromId)});
        }
      });
      doc['$or'] = items;
    }

    if (doc && doc.hasOwnProperty('items')) {
      doc['items'].map((it: any) => {
        if (it && it.hasOwnProperty('productId')) {
          const productId = it.productId;
          if (typeof productId === 'string' && productId.length === 24) {
            it.productId = new ObjectID(productId);
          }
        }
      });
    }

    if (doc && doc.hasOwnProperty('ownerIds')) {
      const ids: ObjectID[] = [];
      doc['ownerIds'].map((id: any) => {
        if (id) {
          if (typeof id === 'string' && id.length === 24) {
            ids.push(new ObjectID(id));
          }
        }
      });
      doc['ownerIds'] = ids;
    }

    return doc;
  }

  bulkUpdate(items: any[], options?: any): Promise<BulkWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        const clonedArray: any[] = JSON.parse(JSON.stringify(items));
        const a: any[] = [];

        clonedArray.map(item => {
          let query = item.query;
          let doc = item.data;
          
          query = this.convertIdFields(query);
          doc = this.convertIdFields(doc);
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

  // use for test
  bulkDelete(queries: any[], options?: any): Promise<BulkWriteOpResultObject> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        const clonedArray: any[] = JSON.parse(JSON.stringify(queries));
        const a: any[] = [];

        clonedArray.map(query => {
          query = this.convertIdFields(query);
          delete query['id'];
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

  // deprecated
  replaceById(id: string, doc: any, options?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        doc = this.convertIdFields(doc);
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
        items.map(it => {
          it = this.convertIdFields(it);
        });
        
        c.insertMany(items, {}, (err: MongoError, r: any) => { //InsertWriteOpResult
          if (!err) {
            const rs: any[] = [];
            r.ops.map((obj: any) => {
              if (obj && obj._id) {
                obj.id = obj._id;
                // delete (obj._id);
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
        query = this.convertIdFields(query);
        c.deleteMany(query, options, (err, ret) => { // DeleteWriteOpResultObject
          resolve(ret); // ret.deletedCount
        });
      });
    });
  }
}