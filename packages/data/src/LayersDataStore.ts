import createVanilla from 'zustand/vanilla';
import {
  DEFAULT_CONFIG,
  fetchCsv,
  Flow,
  FlowMapState,
  getColorsRGBA,
  getFlowsForFlowMapLayer,
  getInitialState,
  getLocationCentroid,
  getLocations,
  getLocationsForFlowMapLayer,
  getLocationsHavingFlows,
  LayersData,
  LoadingState,
  LoadingStatus,
  Location,
  MAX_PITCH,
  MAX_ZOOM_LEVEL,
  MIN_PITCH,
  MIN_ZOOM_LEVEL,
  ViewportProps,
} from './';
import { ColorsRGBA } from '@flowmap.gl/core';
import getColors from './colors';
import prepareLayersData from './prepareLayersData';
import prepareFlows from './prepareFlows';
import { getViewStateForLocations } from './getViewStateForFeatures';

export type LayersDataStore = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (flowsUrl: string) => void;
  getLayersData: () => LayersData | undefined;
  getFlowMapColorsRGBA(): ColorsRGBA;
  // dispatch: (action: Action) => void;
  flowMapState: FlowMapState;
  getViewportForLocations: ([width, height]: [number, number]) => ViewportProps | undefined;
};

export function createLayersDataStore() {
  const store = createVanilla<LayersDataStore>(
    (set, get, api): LayersDataStore => {
      function getPropsForSelectors() {
        const { locations, flows } = get();
        if (locations?.status === LoadingStatus.DONE && flows?.status === LoadingStatus.DONE) {
          return {
            locations: locations.data,
            flows: flows.data,
          };
        } else {
          return undefined;
        }
      }

      return {
        locations: undefined,
        flows: undefined,
        flowMapState: getInitialState(DEFAULT_CONFIG, [0, 0], ''),

        // dispatch: action => set(state => ({ flowMapState: mainReducer(state.flowMapState, action) })),

        loadLocations: async (locationsUrl) => {
          const result = await fetchCsv(locationsUrl, (row) => ({
            id: `${row.id}`,
            name: `${row.name || row.id}`,
            lat: Number(row.lat),
            lon: Number(row.lon),
          }));
          console.log(result);
          set({ locations: result });
        },

        loadFlows: async (flowsUrl) => {
          const result = await fetchCsv(flowsUrl, (row: any) => ({
            ...row,
            count: +row.count,
          }));
          if (result.status === LoadingStatus.DONE) {
            set({ flows: { ...result, data: prepareFlows(result.data) } });
          }
          set({ flows: result });
        },

        getFlowMapColorsRGBA() {
          // const flowMapColors = getFlowMapColors(state, props);
          // return isDiffColors(flowMapColors)
          //     ? getDiffColorsRGBA(flowMapColors)
          //     : getColorsRGBA(flowMapColors);
          return getColorsRGBA(getColors(false, undefined, false, false, 0, false));
        },

        getViewportForLocations([width, height]) {
          const props = getPropsForSelectors();
          if (!props) {
            return undefined;
          }
          const { flowMapState } = get();
          const { adjustViewportToLocations, viewport } = flowMapState;
          if (!adjustViewportToLocations) {
            return undefined;
          }

          const allLocations = getLocations(flowMapState, props);

          if (allLocations != null) {
            const locationsHavingFlows = getLocationsHavingFlows(flowMapState, props);
            let draft = getViewStateForLocations(
              locationsHavingFlows ?? allLocations,
              getLocationCentroid,
              [width, height],
              { pad: 0.1 }
            );

            if (!draft.zoom) {
              draft = {
                zoom: 1,
                latitude: 0,
                longitude: 0,
              };
            }

            return {
              width,
              height,
              ...draft,
              minZoom: MIN_ZOOM_LEVEL,
              maxZoom: MAX_ZOOM_LEVEL,
              minPitch: MIN_PITCH,
              maxPitch: MAX_PITCH,
              bearing: 0,
              pitch: 0,
              altitude: 1.5,
            };
          }

          return undefined;
        },

        // TODO: layers should take the state props affecting flow filtering/clustering/colors/etc
        //       then call selectors to prepare flows and locations
        getLayersData() {
          // There's no point in keeping layersData in the store because it won't be usable in
          // the worker context after it's transferred to the main thread.
          const { getFlowMapColorsRGBA, flowMapState } = get();
          const props = getPropsForSelectors();
          if (!props) {
            return undefined;
          }
          // TODO: start a new worker here and terminate it in case a new getLayersData request arrives
          return prepareLayersData(
            getLocationsForFlowMapLayer(flowMapState, props)!,
            getFlowsForFlowMapLayer(flowMapState, props)!,
            getFlowMapColorsRGBA()
          );
        },
      };
    }
  );
  // const {getState, setState, subscribe, destroy} = store;
  return store;
}
