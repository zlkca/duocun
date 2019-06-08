"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Entity {
    constructor(dbo, name) {
        this.db = dbo.getDb();
        this.collectionName = name;
    }
    getCollection() {
        if (this.db) {
            const collection = this.db.collection(this.collectionName);
            if (collection) {
                return new Promise((resolve, reject) => {
                    resolve(collection);
                });
            }
            else {
                return this.db.createCollection(this.collectionName);
            }
        }
        else {
            return new Promise((resolve, reject) => {
                reject(null);
            });
        }
    }
    insertOne(doc) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getCollection().then((c) => {
                c.insertOne(doc).then((result) => {
                    const ret = (result.ops && result.ops.length) ? result.ops[0] : null;
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
    distinct(key, query, options) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getCollection().then((c) => {
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
    findOne(query, options) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.getCollection().then((c) => {
                c.findOne(query, options, (err, doc) => {
                    if (doc && doc._id) {
                        doc.id = doc._id;
                        delete (doc._id);
                    }
                    resolve(doc);
                });
            });
        });
    }
    find(query, options) {
        const self = this;
        if (query && query.hasOwnProperty('id')) {
            let body = query.id;
            if (body && body.hasOwnProperty('$in')) {
                let a = body['$in'];
                const arr = [];
                a.map((id) => {
                    arr.push({ _id: new mongodb_1.ObjectID(id) });
                });
                query = { $or: arr };
            }
            else if (typeof body === "string") {
                query['_id'] = new mongodb_1.ObjectID(query.id);
                delete query['id'];
            }
        }
        return new Promise((resolve, reject) => {
            self.getCollection().then((c) => {
                c.find(query, options).toArray((err, docs) => {
                    let s = [];
                    if (docs && docs.length > 0) {
                        docs.map((v, i) => {
                            if (v && v._id) {
                                v.id = v._id;
                                delete (v._id);
                            }
                            s.push(v);
                        });
                    }
                    resolve(s);
                });
            });
        });
    }
    replaceOne(query, doc, options) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.replaceOne(query, doc, options, (err, result) => {
                    if (result && result._id) {
                        result.id = result._id;
                        delete (result._id);
                    }
                    resolve(result);
                });
            });
        });
    }
    updateOne(query, doc, options) {
        if (query && query.hasOwnProperty('id')) {
            query['_id'] = new mongodb_1.ObjectID(query.id);
            delete query['id'];
        }
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.updateOne(query, { $set: doc }, options, (err, result) => {
                    if (result && result._id) {
                        result.id = result._id;
                        delete (result._id);
                    }
                    resolve(result);
                });
            });
        });
    }
    bulkUpdate(items, options) {
        this.getCollection().then((c) => {
            items.map(item => {
                let query = item.query;
                let doc = item.data;
                if (query && query.hasOwnProperty('id')) {
                    query['_id'] = new mongodb_1.ObjectID(query.id);
                    delete query['id'];
                }
                c.updateOne(query, { $set: doc }, options, (err, result) => {
                    if (result && result._id) {
                        result.id = result._id;
                        delete (result._id);
                    }
                });
            });
        });
    }
    replaceById(id, doc, options) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.replaceOne({ _id: new mongodb_1.ObjectId(id) }, doc, options, (err, result) => {
                    if (result.ops) {
                        let obj = result.ops[0];
                        if (obj && obj._id) {
                            obj.id = obj._id;
                            delete (obj._id);
                        }
                        resolve(obj);
                    }
                    else {
                        console.log('replaceById failed.');
                        reject();
                    }
                });
            });
        });
    }
    deleteById(id) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.deleteOne({ _id: new mongodb_1.ObjectID(id) }, (err, doc) => {
                    resolve(doc);
                });
            });
        });
    }
    insertMany(items) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.insertMany(items, {}, (err, docs) => {
                    resolve(docs);
                });
            });
        });
    }
    deleteMany(query, options) {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c) => {
                c.deleteMany(query, options, (err, ret) => {
                    resolve(ret);
                });
            });
        });
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.js.map