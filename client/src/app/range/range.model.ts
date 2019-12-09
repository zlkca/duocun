export interface IRange {
  _id?: string;
  name?: string;
  lat?: number;
  lng?: number;
  radius?: number; // m
  overRangeRate?: number;
  created?: Date;
  modified?: Date;
}

export class Range implements IRange {
  _id?: string;
  name?: string;
  lat?: number;
  lng?: number;
  radius?: number; // m
  overRangeRate?: number;
  created?: Date;
  modified?: Date;
}
