import { Db, Collection } from "mongodb";

export class Entity {
    private db: any;
    private collectionName: string;

    constructor(db: Db, name: string) {
        this.db = db;
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
        return new Promise((resolve, reject) => {
            this.getCollection().then((c: Collection) => {
                c.insertOne(doc).then((x: any) => {
                    resolve(x);
                }, err => {
                    reject(err);
                });
            });
        });
    }

    findOne(query: any, options?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getCollection().then((c: Collection) => {
                c.findOne(query, options).then((x: any) => {
                    resolve(x);
                }, err => {
                    reject(err);
                });
            });
        });
    }
}