import create from 'zustand/vanilla';
import {
  fetchCsv,
  Flow, getColorsRGBA,
  LayersAttributes,
  LoadingState,
  LoadingStatus,
  Location,
  prepareFlows,
  prepareLayersData
} from './';
import {ColorsRGBA} from '@flowmap.gl/core';
import getColors from './colors';

export type DataStore = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (flowsUrl: string) => void;
  getLayersData: () => LayersAttributes | undefined;
  getFlowMapColorsRGBA(): ColorsRGBA;
}

export function createDataStore() {
  const store = create<DataStore>(
    (set, get, api): DataStore => ({
      locations: undefined,
      flows: undefined,

      loadLocations: async (locationsUrl) => {
        const result = await fetchCsv(locationsUrl,
          (row) => ({
            id: `${row.id}`,
            name: `${row.name || row.id}`,
            lat: Number(row.lat),
            lon: Number(row.lon),
          })
        );
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

      getFlowMapColorsRGBA() {
        // const flowMapColors = getFlowMapColors(state, props);
        // return isDiffColors(flowMapColors)
        //     ? getDiffColorsRGBA(flowMapColors)
        //     : getColorsRGBA(flowMapColors);
        return getColorsRGBA(
          getColors(
            false, undefined, false, false, 0, false
          )
        );
      },

      getLayersData() {
        const {locations, flows, getFlowMapColorsRGBA} = get();
        if (locations?.status === LoadingStatus.DONE && flows?.status === LoadingStatus.DONE) {
          return prepareLayersData(locations.data, flows.data, getFlowMapColorsRGBA());
        }
        return undefined;
      }
    }),
  );
  // const {getState, setState, subscribe, destroy} = store;
  return store;
}
