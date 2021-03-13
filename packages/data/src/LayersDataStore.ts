import create from 'zustand/vanilla';
import {
  Action, DEFAULT_CONFIG,
  fetchCsv,
  Flow, getColorsRGBA, getInitialState,
  LayersData,
  LoadingState,
  LoadingStatus,
  Location,
  mainReducer,
  FlowMapState,
} from './';
import {ColorsRGBA} from '@flowmap.gl/core';
import getColors from './colors';
import prepareLayersData from './prepareLayersData';
import prepareFlows from './prepareFlows';

export type LayersDataStore = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (flowsUrl: string) => void;
  getLayersData: () => LayersData | undefined;
  getFlowMapColorsRGBA(): ColorsRGBA;
  dispatch: (action: Action) => void;
  flowMapState: FlowMapState;
}

export function createLayersDataStore() {
  const store = create<LayersDataStore>(
    (set, get, api): LayersDataStore => ({
      locations: undefined,
      flows: undefined,
      flowMapState: getInitialState(DEFAULT_CONFIG, [0,0], ''),

      dispatch: action => set(state => ({ flowMapState: mainReducer(state.flowMapState, action) })),

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

      // TODO: layers should take the state props affecting flow filtering/clustering/colors/etc
      //       then call selectors to prepare flows and locations
      getLayersData() {
        // There's no point in keeping layersData in the store because it won't be usable in
        // the worker context after it's transferred to the main thread.
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
