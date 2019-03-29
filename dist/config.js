"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class Config {
    constructor() {
        this.GEOCODE_KEY = '';
        this.GOOGLE_PLACE_KEY = '';
        this.GOOGLE_MAP_KEY = '';
        this.GOOGLE_DISTANCE_KEY = '';
        this.cfg = JSON.parse(fs_1.default.readFileSync('../duocun.cfg.json', 'utf-8'));
        this.JWT = this.cfg.JWT;
        this.GEOCODE_KEY = this.cfg.GEOCODE.KEY;
        this.GOOGLE_PLACE_KEY = this.cfg.GOOGLE_PLACE.KEY;
        this.GOOGLE_MAP_KEY = this.cfg.GOOGLE_MAP_KEY;
        this.GOOGLE_DISTANCE_KEY = this.cfg.GOOGLE_DISTANCE.KEY;
        this.API_SERVER = this.cfg.API_SERVER;
        this.DATABASE = this.cfg.DATABASE;
    }
}
exports.Config = Config;
//# sourceMappingURL=config.js.map