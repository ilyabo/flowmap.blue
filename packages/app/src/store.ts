import * as Comlink from 'comlink';
import create from 'zustand/vanilla';

/* eslint-disable import/no-webpack-loader-syntax */
import WorkerDataProvider from 'worker-loader!./WorkerDataProvider';
import {ColorsRGBA} from '@flowmap.gl/core';
import {
  Action,
  DEFAULT_CONFIG, FlowMapState,
  getInitialState,
  LayersData,
  LoadingState,
  LoadingStatus,
  mainReducer
} from '@flowmap.blue/data';
import {DataProvider} from './DataProvider';

const workerDataProvider = new WorkerDataProvider();
const dataProvider = Comlink.wrap<DataProvider>(workerDataProvider);

export type Store = {
  locationsStatus: LoadingStatus | undefined;
  flowsStatus: LoadingStatus | undefined;
  layersData: LoadingState<LayersData> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (locationsUrl: string) => void;
  // getFlowMapColorsRGBA(): ColorsRGBA;
  // getLayersData(): LayersData | undefined;
  dispatch: (action: Action) => void;
  flowMapState: FlowMapState;
};

export const store = create<Store>(
  (set, get): Store => {
    async function updateLayersData() {
      const {locationsStatus, flowsStatus} = get();
      if (locationsStatus === LoadingStatus.DONE && flowsStatus === LoadingStatus.DONE) {
        set({ layersData: { status: LoadingStatus.LOADING }});
        try {
          const layersData = await dataProvider.getLayersData();
          // TODO: error handling
          set({ layersData: { status: LoadingStatus.DONE, data: layersData! }});
        } catch (err) {
          set({ layersData: { status: LoadingStatus.ERROR }});
        }
      } else {
        if (locationsStatus === LoadingStatus.ERROR || flowsStatus === LoadingStatus.ERROR) {
          set({ layersData: { status: LoadingStatus.ERROR }});
        }
      }
    }
    return ({
      locationsStatus: undefined,
      flowsStatus: undefined,
      layersData: undefined,

      // TODO: this should be done through dispatch
      flowMapState: getInitialState(DEFAULT_CONFIG, [0,0], ''),
      dispatch: async action => {
        console.log('store.dispatch',action);
        set(state => ({ flowMapState: mainReducer(state.flowMapState, action) }));
        await dataProvider.dispatch(action);
      },
      loadLocations: async (locationsUrl) => {
        set({ layersData: { status: LoadingStatus.LOADING} });
        set({ locationsStatus: await dataProvider.loadLocations(locationsUrl) });
        await updateLayersData();
      },
      loadFlows: async (flowsUrl) => {
        set({ layersData: { status: LoadingStatus.LOADING }});
        set({ flowsStatus: await dataProvider.loadFlows(flowsUrl) });
        await updateLayersData();
      },
    });
  }
)

export default store;
