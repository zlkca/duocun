
import fs from 'fs';

export interface IJWT {
  EXPIRY: string;   // eg. '365 days'
  ALGORITHM: string;
  SECRET: string;
}

export interface IApiServer {
  PORT: number; //8000,
  ROUTE_PREFIX: string; // "api"
}

export interface IDatabase {
  // "DATABASE":{
  //   "HOST":"localhost",
  //   "NAME":"duocun",
  //   "PORT": 27017,
  //   "POOL_SIZE":10,
  //   "USERNAME":"x",
  //   "PASSWORD":"x"
  // },
  HOST: string;
  NAME: string;
  PORT: number;
  POOL_SIZE: number;
  USERNAME: string;
  PASSWORD: string;
}

export interface ISmsProvider {
  SID: string;
  TOKEN: string;
  FROM: string;
}

export interface ISNS {
  APP_ID: string;
  APP_SECRET: string;
}

export interface ISnappay {
  APP_ID: string;
  MERCHANT_ID: string;
  PRIVATE_KEY: string;
  PUBLIC_KEY: string;
  MD5_KEY: string;
}

export interface IStripe{
  API_KEY: string;
}

export class Config {
  private cfg: any;
  public JWT: IJWT;
  public GEOCODE_KEY: string = '';
  public GOOGLE_PLACE_KEY: string = '';
  public GOOGLE_MAP_KEY: string = '';
  public GOOGLE_DISTANCE_KEY: string = '';
  public API_SERVER: IApiServer;
  public DATABASE: IDatabase;
  public TWILIO: ISmsProvider;
  public WECHAT: ISNS;
  public STRIPE: IStripe;
  public SNAPPAY: ISnappay;
  
  constructor() {
    this.cfg = JSON.parse(fs.readFileSync('../duocun.cfg.json', 'utf-8'));
    this.JWT = this.cfg.JWT;
    this.GEOCODE_KEY = this.cfg.GEOCODE.KEY;
    this.GOOGLE_PLACE_KEY = this.cfg.GOOGLE_PLACE.KEY;
    this.GOOGLE_MAP_KEY = this.cfg.GOOGLE_MAP_KEY;
    this.GOOGLE_DISTANCE_KEY = this.cfg.GOOGLE_DISTANCE.KEY;
    this.API_SERVER = this.cfg.API_SERVER;
    this.DATABASE = this.cfg.DATABASE;
    this.TWILIO = this.cfg.TWILIO;
    this.WECHAT = this.cfg.WECHAT;
    this.STRIPE = this.cfg.STRIPE;
    this.SNAPPAY = this.cfg.SNAPPAY;
  }

}
  