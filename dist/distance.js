"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const entity_1 = require("./entity");
const config_1 = require("./config");
const https_1 = __importDefault(require("https"));
class Distance extends entity_1.Entity {
    constructor(dbo) {
        super(dbo, 'distances');
        this.cfg = new config_1.Config();
    }
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
    reqRoadDistances(req, res) {
        let key = this.cfg.GOOGLE_DISTANCE_KEY;
        let origin = req.body.origins[0]; // should be only one location
        let sOrigin = `${origin.lat},${origin.lng}`;
        // let malls = req.body.destinations;
        let destinations = [];
        req.body.destinations.map((d) => {
            destinations.push(`${d.lat},${d.lng}`);
        });
        let sDestinations = destinations.join('|');
        let url = 'https://maps.googleapis.com/maps/api/distancematrix/json?region=ca&origins=' + sOrigin + '&destinations=' + sDestinations + '&key=' + key;
        https_1.default.get(url, (res1) => {
            let data = '';
            res1.on('data', (d) => {
                // process.stdout.write(d);
                data += d;
                // console.log('receiving: ' + d);
            });
            res1.on('end', (rr) => {
                // console.log('receiving done!');
                if (data) {
                    const s = JSON.parse(data);
                    const rows = s.rows;
                    const distances = [];
                    if (rows && rows.length > 0 && rows[0].elements && rows[0].elements.length > 0) {
                        // const elements = rows[0].elements;
                        for (let i = 0; i < destinations.length; i++) {
                            // elements[i].id = malls[i].id;
                            // elements[i].stuffs = malls[i].stuffs;
                            // elements[i].name = malls[i].name;
                            // elements[i].type = malls[i].type;
                            // elements[i].origin = origin;
                            // elements[i].destination = destinations[i];
                            const destination = req.body.destinations[i];
                            distances.push({
                                originPlaceId: origin.placeId,
                                destinationPlaceId: destination.placeId,
                                origin: origin,
                                destination: destination,
                                element: rows[0].elements[i],
                            });
                        }
                        res.send(distances);
                        this.insertMany(distances).then(() => {
                            console.log('distances inserted');
                        });
                    }
                    else {
                        res.send('');
                    }
                }
                else {
                    res.send('');
                }
            });
        });
    }
}
exports.Distance = Distance;
//# sourceMappingURL=distance.js.map