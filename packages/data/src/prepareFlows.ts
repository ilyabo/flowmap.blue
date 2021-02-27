import {nest} from 'd3-collection';
import {Flow} from './types';
import {parseTime} from './time';

export function prepareFlows(rows: any[]) {
  let dupes: Flow[] = [];
  // Will sum up duplicate flows (with same origin, dest and time)
  const byOriginDestTime = nest<any, Flow>()
  .key((d: any) => d.origin)
  .key((d: any) => d.dest)
  .key((d: any) => parseTime(d.time)?.toISOString() || 'unknown')
  .rollup((dd) => {
    const { origin, dest, time } = dd[0];
    if (dd.length > 1) {
      dupes.push(dd[0]);
    }
    return {
      origin,
      dest,
      time: parseTime(time),
      count: dd.reduce((m, d) => {
        if (d.count != null) {
          const c = +d.count;
          if (!isNaN(c) && isFinite(c)) return m + c;
        }
        return m;
      }, 0),
    };
  })
  .entries(rows);
  const rv: Flow[] = [];
  for (const byDestTime of byOriginDestTime) {
    for (const byTime of byDestTime.values) {
      for (const { value } of byTime.values) {
        if (value.origin != null && value.dest != null) {
          rv.push(value);
        }
      }
    }
  }
  return rv;
}