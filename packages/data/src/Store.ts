import create from 'zustand/vanilla';
import {Flow, Location} from './';
import {fetchCsv, LoadingState, LoadingStatus, prepareFlows} from './';
// import {getColorsRGBA, getDiffColorsRGBA, isDiffColors} from '@flowmap.gl/core';

export type Store = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (flowsUrl: string) => void;
}

export function createStore() {
  const store = create<Store>(
    (set): Store => ({
      locations: undefined,
      flows: undefined,
      loadLocations: async (locationsUrl) => {
        console.log('loadLocations');
        const result = await fetchCsv(locationsUrl,
          (row) => ({
            id: `${row.id}`,
            name: `${row.name || row.id}`,
            lat: Number(row.lat),
            lon: Number(row.lon),
          })
        );
        console.log(result);
        set({locations: result});
      },
      loadFlows: async (flowsUrl) => {
        const result = await fetchCsv(flowsUrl,
          (row: any) => ({
            ...row,
            count: +row.count,
          })
        );
        if (result.status === LoadingStatus.DONE) {
          set({flows: {...result, data: prepareFlows(result.data)}});
        }
        set({flows: result});
      },
    })
  );
  // const {getState, setState, subscribe, destroy} = store;
  return store;
}
