import { wrap } from 'comlink';
import createVanilla from 'zustand/vanilla';
import create from 'zustand';
import throttle from 'lodash.throttle';
import {
  createFlowMapStore,
  DataFormat,
  FlowMapState,
  LayersData,
  LoadingState,
  LoadingStatus,
  ViewportProps,
  WorkerDataProvider,
} from '@flowmap.blue/data';
/* eslint-disable import/no-webpack-loader-syntax */
import AppWorkerDataProvider from 'worker-loader!./AppWorkerDataProvider';

const workerDataProvider = wrap<WorkerDataProvider>(new AppWorkerDataProvider());

export type AppStore = {
  reset: () => void;
  locationsStatus: LoadingStatus | undefined;
  flowsStatus: LoadingStatus | undefined;
  layersData: LoadingState<LayersData> | undefined;
  loadLocations: (locationsUrl: string, dataFormat?: DataFormat) => Promise<void>;
  loadFlows: (locationsUrl: string, dataFormat?: DataFormat) => Promise<void>;
  // getFlowMapColorsRGBA(): ColorsRGBA;
  // getLayersData(): LayersData | undefined;
  // dispatch: (action: Action) => void;
  // flowMapState: FlowMapState | undefined;
  // setFlowMapState: (flowMapState: FlowMapState) => void;
  updateLayersData: () => void;
  getViewportForLocations: ([width, height]: [number, number]) => Promise<
    ViewportProps | undefined
  >;
};

const INITIAL_STATE = {
  locationsStatus: undefined,
  flowsStatus: undefined,
  layersData: undefined,
};

export const appStore = createVanilla<AppStore>(
  (set, get): AppStore => {
    async function updateLayersData() {
      const { locationsStatus, flowsStatus } = get();
      if (locationsStatus === LoadingStatus.DONE && flowsStatus === LoadingStatus.DONE) {
        // set({ layersData: { status: LoadingStatus.LOADING }});
        try {
          const layersData = await workerDataProvider.getLayersData();
          // TODO: error handling
          set({ layersData: { status: LoadingStatus.DONE, data: layersData! } });
        } catch (err) {
          console.error(err);
          set({ layersData: { status: LoadingStatus.ERROR } });
        }
      } else {
        if (locationsStatus === LoadingStatus.ERROR || flowsStatus === LoadingStatus.ERROR) {
          set({ layersData: { status: LoadingStatus.ERROR } });
        }
      }
    }
    return {
      ...INITIAL_STATE,
      updateLayersData,
      // flowMapState: undefined,
      // setFlowMapState: async (flowMapState) => {
      //   const next = {
      //     ...flowMapState,
      //     viewport: pickViewportProps(flowMapState.viewport),
      //   };
      //   console.log(next);
      //   await workerDataProvider.setFlowMapState(next);
      //   await updateLayersData();
      // },

      //getInitialState(DEFAULT_CONFIG, [0,0], ''),
      // dispatch: async action => {
      //   console.log('store.dispatch',action);
      //   set(state => ({ flowMapState: mainReducer(state.flowMapState, action) }));
      //   await workerDataProvider.dispatch(action);
      // },
      // clearData: async () => {
      //   set({
      //     layersData: { status: LoadingStatus.LOADING },
      //   });
      //   await workerDataProvider.clearData();
      // },

      async reset() {
        set(INITIAL_STATE);
        await workerDataProvider.clearData();
      },

      loadLocations: async (locationsUrl, dataFormat = 'csv') => {
        const { layersData } = get();
        set({
          layersData: { status: LoadingStatus.LOADING },
          locationsStatus: await workerDataProvider.loadLocations(locationsUrl, dataFormat),
        });
        await updateLayersData();
      },
      loadFlows: async (flowsUrl, dataFormat = 'csv') => {
        const { layersData } = get();
        set({
          layersData: { ...layersData, status: LoadingStatus.LOADING },
          flowsStatus: await workerDataProvider.loadFlows(flowsUrl, dataFormat),
        });
        await updateLayersData();
      },

      getViewportForLocations: async (dims) => workerDataProvider.getViewportForLocations(dims),
    };
  }
);

export const useAppStore = create<AppStore>(appStore);
export const useFlowMapStore = createFlowMapStore();
useFlowMapStore.subscribe(
  // When map state changes, get the updated layers data from the worker
  throttle(
    async (flowMapState: FlowMapState) => {
      await workerDataProvider.setFlowMapState(flowMapState);
      // TODO: don't call if nothing relevant has changed in the state
      await appStore.getState().updateLayersData();
    },
    100,
    { leading: true, trailing: true }
  ),
  (state) => state.flowMapState
);
