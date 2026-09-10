export type CityType =
  | 'capital'
  | 'beach'
  | 'history'
  | 'nature'
  | 'coastal-city';

export interface Restaurant {
  name: string;
  cuisine: string;
  price: '$' | '$$' | '$$$';
  note: string;
}

export interface Attraction {
  name: string;
  note: string;
  wikiTitle: string;
  extraHours: number; // approx round-trip detour hours from the parent city
}

export interface City {
  id: string;
  name: string;
  types: CityType[];
  coords: [number, number];
  wikiTitle: string;
  blurb: string;
  nightsRecommended: [number, number]; // [min, max] sensible nights to spend
  restaurants: Restaurant[];
  attractions?: Attraction[];
  isHub?: boolean; // arrival/departure city
}

export type DriveMatrix = Record<string, Record<string, number>>;

export interface CountryData {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  hubCityId: string;
  cities: City[];
  driveHours: DriveMatrix;
  travelNote: string;
  /** simplified national border, as [lon, lat] pairs, for the illustrative map */
  outline: [number, number][];
}
