import createVanilla from 'zustand/vanilla';
import {
  ColorsRGBA,
  DataFormat,
  DEFAULT_CONFIG,
  DiffColorsRGBA,
  fetchCsv,
  fetchGsheet,
  Flow,
  FlowMapState,
  getColorsRGBA,
  getDiffColorsRGBA,
  getFlowMapColors,
  getFlowsForFlowMapLayer,
  getInitialState,
  getLocationCentroid,
  getLocations,
  getLocationsForFlowMapLayer,
  getLocationsHavingFlows,
  isDiffColors,
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
import getColors from './colors';
import prepareLayersData from './prepareLayersData';
import prepareFlows from './prepareFlows';
import { getViewStateForLocations } from './getViewStateForFeatures';

export type LayersDataStore = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  clearData: () => void;
  loadLocations: (locationsUrl: string, dataFormat: DataFormat) => void;
  loadFlows: (flowsUrl: string, dataFormat: DataFormat) => void;
  getLayersData: () => LayersData | undefined;
  getFlowMapColorsRGBA(): DiffColorsRGBA | ColorsRGBA;
  // dispatch: (action: Action) => void;
  flowMapState: FlowMapState;
  getViewportForLocations: ([width, height]: [number, number]) => ViewportProps | undefined;
};

const INITIAL = {
  locations: undefined,
  flows: undefined,
  flowMapState: getInitialState(DEFAULT_CONFIG, [0, 0], ''),
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
          return {
            locations: undefined,
            flows: undefined,
          };
        }
      }

      return {
        ...INITIAL,

        // dispatch: action => set(state => ({ flowMapState: mainReducer(state.flowMapState, action) })),

        clearData: () => {
          set(INITIAL);
        },

        loadLocations: async (locationsUrl, dataFormat) => {
          const fetchFn = getFetchFunction(dataFormat);
          if (!fetchFn) return;
          const result = await fetchFn(locationsUrl);
          if (result.status === LoadingStatus.DONE) {
            set({
              locations: {
                ...result,
                data: result.data.map(
                  (row: any) =>
                    ({
                      id: `${row.id}`,
                      name: `${row.name || row.id}`,
                      lat: Number(row.lat),
                      lon: Number(row.lon),
                    } as Location)
                ),
              },
            });
          }
        },

        loadFlows: async (flowsUrl, dataFormat) => {
          const fetchFn = getFetchFunction(dataFormat);
          if (!fetchFn) return;
          const result = await fetchFn(flowsUrl);
          if (result.status === LoadingStatus.DONE) {
            set({ flows: { ...result, data: prepareFlows(result.data) } });
          }
        },

        getFlowMapColorsRGBA() {
          const { flowMapState } = get();
          const flowMapColors = getFlowMapColors(flowMapState, getPropsForSelectors());
          return isDiffColors(flowMapColors)
            ? getDiffColorsRGBA(flowMapColors)
            : getColorsRGBA(flowMapColors);
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
          // TODO: start a new worker here and terminate it in case a new getLayersData request arrives
          const locations = getLocationsForFlowMapLayer(flowMapState, getPropsForSelectors());
          const flows = getFlowsForFlowMapLayer(flowMapState, getPropsForSelectors());
          if (locations && flows) {
            return prepareLayersData(locations, flows, getFlowMapColorsRGBA());
          } else {
            return undefined;
          }
        },
      };
    }
  );
  // const {getState, setState, subscribe, destroy} = store;
  return store;
}

function getFetchFunction(dataFormat: DataFormat) {
  switch (dataFormat) {
    case 'csv':
      return fetchCsv;
    case 'gsheets':
      return fetchGsheet;
    default:
      console.error(`Unsupported data format: ${dataFormat}`);
      return undefined;
  }
}
