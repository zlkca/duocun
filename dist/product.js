"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const entity_1 = require("./entity");
class Product extends entity_1.Entity {
    constructor(dbo) {
        super(dbo, 'products');
    }
    // only by id
    get(req, res) {
        const id = req.params.id;
        this.findOne({ _id: new mongodb_1.ObjectID(id) }).then((r) => {
            if (r) {
                res.send(JSON.stringify(r, null, 3));
            }
            else {
                res.send(JSON.stringify(null, null, 3));
            }
        });
    }
    uploadPicture(req, res) {
        const fname = req.body.fname + '.' + req.body.ext;
        if (fname) {
            res.send(JSON.stringify({ fname: fname, url: fname }, null, 3));
        }
        else {
            res.send(JSON.stringify(null, null, 3));
        }
    }
    find(query, options) {
        const self = this;
        if (query && query.hasOwnProperty('id')) {
            let body = query.id;
            if (body && '$in' in body) {
                let a = body['$in'];
                const arr = [];
                a.map((id) => {
                    arr.push({ _id: new mongodb_1.ObjectID(id) });
                });
                query = { $or: arr };
            }
        }
        if (query && query.hasOwnProperty('dow')) {
            if (query.dow !== null) {
                query['dow'] = { $in: [query.dow.toString(), 'all'] };
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
}
exports.Product = Product;
//# sourceMappingURL=product.js.map