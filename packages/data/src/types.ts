export interface Location {
  id: string;
  lon: number;
  lat: number;
  name: string;
}

export interface LocationTotals {
  incoming: number;
  outgoing: number;
  within: number;
}

export interface Flow {
  origin: string;
  dest: string;
  count: number;
  time?: Date;
}
