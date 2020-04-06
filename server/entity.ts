import { Collection, ObjectId, ObjectID, InsertWriteOpResult, MongoError, BulkWriteResult, BulkWriteOpResultObject, InsertOneWriteOpResult } from "mongodb";
import { DB } from "./db";
import { Db } from 'mongodb';
import moment from 'moment';

export enum DbStatus {
  SUCCESS = 1,
  FAIL
}

export interface DbResult {
  status: DbStatus,
  msg: string
}

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

  // v2
  filter(doc: any, fields?: string[]) {
    if (fields && fields.length > 0) {
      const it: any = {};
      fields.map((key: any) => {
        // if(key.indexOf(':')!== -1){
        //   const parentKey = key.split(':')[0];
        //   const children = key.split(':')[1].split(',').map((c: any) => c.trim());
        // }
        it[key] = doc[key];
      });
      return it;
    } else {
      return doc;
    }
  }

  filterArray(rs: any[], fields?: string[]) {
    if (fields && fields.length > 0) {
      const xs: any[] = [];
      if (rs && rs.length > 0) {
        rs.map(r => {
          const x = this.filter(r, fields);
          xs.push(x);
        });
        return xs;
      } else {
        return xs;
      }
    } else {
      return rs;
    }
  }

  // quick find
  async find(query: any, options?: any, fields?: any[]) {
    const self = this;
    query = this.convertIdFields(query);

    const c = await self.getCollection();
    const docs = await c.find(query, options).toArray();
    const rs = this.filterArray(docs, fields);
    return rs;
  }

  // v1
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

  // load(query: any, params?: any): Promise<any> {
  //   const self = this;
  //   if (query && query.hasOwnProperty('id')) {
  //     let body = query.id;
  //     if (body && body.hasOwnProperty('$in')) {
  //       let a = body['$in'];
  //       const arr: any[] = [];
  //       a.map((id: string) => {
  //         arr.push({ _id: new ObjectID(id) });
  //       });

  //       query = { $or: arr };
  //     } else if (typeof body === "string") {
  //       query['_id'] = new ObjectID(query.id);
  //       delete query['id'];
  //     }
  //   }

  //   return new Promise((resolve, reject) => {
  //     self.getCollection().then((c: Collection) => {
  //       this.join(params, query).then((rs: any) => {
  //         resolve(rs);
  //       });
  //     });
  //   });
  // }

  // m --- moment object
  toLocalDateTimeString(m: any) {
    const dt = m.toISOString(true);
    return dt.split('.')[0];
  }

  insertOne(doc: any): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        doc = this.convertIdFields(doc);
        doc.created = moment().toISOString();
        doc.modified = moment().toISOString();

        c.insertOne(doc).then((result: any) => { // InsertOneWriteOpResult
          const ret = (result.ops && result.ops.length > 0) ? result.ops[0] : null;
          resolve(ret);
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
          resolve(doc);
        });
      });
    });
  }

  findOne(query: any, options?: any, fields?: any[]): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.getCollection().then((c: Collection) => {
        query = this.convertIdFields(query);
        c.findOne(query, options, (err, doc) => {
          const r = this.filter(doc, fields);
          resolve(r);
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
    return new Promise((resolve, reject) => {
      if (Object.keys(doc).length === 0 && doc.constructor === Object) {
        resolve();
      } else {
        query = this.convertIdFields(query);
        doc = this.convertIdFields(doc);

        this.getCollection().then((c: Collection) => {
          c.updateOne(query, { $set: doc }, options, (err, r: any) => { // {n: 1, nModified: 0, ok: 1}
            resolve(r.result);
          });
        });
      }
    });
  }

  updateMany(query: any, data: any, options?: any): Promise<any> {
    query = this.convertIdFields(query);
    data = this.convertIdFields(data);

    return new Promise((resolve, reject) => {
      this.getCollection().then((c: Collection) => {
        c.updateMany(query, { $set: data }, options, (err, result: any) => {
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

  getProperty(doc: any, p: string) {
    let k = null;
    if (doc) {
      const keys = Object.keys(doc);
      keys.map(key => {
        if (key) {
          if (key.indexOf(p) !== -1) {
            k = key;
            return k;
          }
        }
      });
      return k;
    } else {
      return k;
    }
  }

  // only support query _id, not id
  convertIdFields(doc: any) {
    if (doc && doc.hasOwnProperty('_id')) {
      let body = doc._id;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === "string" && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id);
          }
        });

        doc['_id'] = { $in: arr };
      } else if (typeof body === "string" && body.length === 24) {
        doc['_id'] = new ObjectID(doc._id);
      }
    }

    if (doc && doc.hasOwnProperty('paymentId')) {
      let body = doc.paymentId;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === "string" && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id);
          }
        });

        doc['paymentId'] = { $in: arr };
      } else if (typeof body === "string" && body.length === 24) {
        doc['paymentId'] = new ObjectID(doc.paymentId);
      }
    }

    if (doc && doc.hasOwnProperty('paymentId')) {
      const paymentId = doc['paymentId'];
      if (typeof paymentId === 'string' && paymentId.length === 24) {
        doc['paymentId'] = new ObjectID(paymentId);
      }
    }

    if (doc && doc.hasOwnProperty('categoryId')) {
      const catId = doc['categoryId'];
      if (typeof catId === 'string' && catId.length === 24) {
        doc['categoryId'] = new ObjectID(catId);
      }
    }
    if (doc && doc.hasOwnProperty('areaId')) {
      const areaId = doc['areaId'];
      if (typeof areaId === 'string' && areaId.length === 24) {
        doc['areaId'] = new ObjectID(areaId);
      }
    }

    if (doc && doc.hasOwnProperty('merchantId')) {
      let body = doc.merchantId;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === "string" && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id);
          }
        });

        doc['merchantId'] = { $in: arr };
      } else if (typeof body === "string" && body.length === 24) {
        doc['merchantId'] = new ObjectID(doc.merchantId);
      }
    }

    if (doc && doc.hasOwnProperty('merchantAccountId')) {
      let body = doc.merchantAccountId;
      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === "string" && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id);
          }
        });

        doc['merchantAccountId'] = { $in: arr };
      } else if (typeof body === "string" && body.length === 24) {
        doc['merchantAccountId'] = new ObjectID(doc.merchantAccountId);
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

    const productIdKey = this.getProperty(doc, 'productId');
    if (productIdKey) {
      const val = doc[productIdKey];
      if (typeof val === 'string' && val.length === 24) {
        doc[productIdKey] = new ObjectID(val);
      } else if (val && val.hasOwnProperty('$in')) {
        let a = val['$in'];
        const arr: any[] = [];
        a.map((id: string) => {
          arr.push(new ObjectID(id));
        });
        doc[productIdKey] = { $in: arr };
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
      } else if (accountId && accountId.hasOwnProperty('$in')) {
        let a = accountId['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === 'string' && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id); // object type
          }
        });
        doc.accountId = { $in: arr };
      }
    }

    if (doc && doc.hasOwnProperty('orderId')) {
      const body = doc['orderId'];

      if (body && body.hasOwnProperty('$in')) {
        let a = body['$in'];
        const arr: any[] = [];
        a.map((id: any) => {
          if (typeof id === "string" && id.length === 24) {
            arr.push(new ObjectID(id));
          } else {
            arr.push(id);
          }
        });

        doc['orderId'] = { $in: arr };
      } else if (typeof body === "string" && body.length === 24) {
        doc['orderId'] = new ObjectID(body);
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

    if (doc && doc.hasOwnProperty('$or')) {
      const items: any[] = [];
      doc['$or'].map((it: any) => {
        if (it && it.hasOwnProperty('toId') && typeof it.toId === 'string' && it.toId.length === 24) {
          items.push({ toId: new ObjectID(it.toId) });
        } else if (it && it.hasOwnProperty('fromId') && typeof it.fromId === 'string' && it.fromId.length === 24) {
          items.push({ fromId: new ObjectID(it.fromId) });
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

  bulkUpdate(items: any[], options?: any): Promise<any> {
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
          if (err) {
            resolve({ status: DbStatus.FAIL, msg: err });
          } else {
            resolve({ status: DbStatus.SUCCESS, msg: '' });
          }
        });
      });
    });
  }

  // use for test
  bulkDelete(queries: any[], options?: any): Promise<DbResult> {
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
            const s: any = err.errmsg;
            resolve({ status: DbStatus.FAIL, msg: s });
          } else {
            resolve({ status: DbStatus.SUCCESS, msg: '' });
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
        c.deleteOne({ _id: new ObjectId(id) }, (err, doc) => { // DeleteWriteOpResultObject
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
            resolve(r.ops);
          } else {
            reject(err);
          }
        });
      });
    });
  }


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