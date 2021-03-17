import { wrap } from 'comlink';
import createVanilla from 'zustand/vanilla';
import create from 'zustand';
import throttle from 'lodash.throttle';

/* eslint-disable import/no-webpack-loader-syntax */
import WorkerDataProvider from 'worker-loader!./WorkerDataProvider';
import {
  createFlowMapStore,
  // DataProvider,
  FlowMapState,
  LayersData,
  LoadingState,
  LoadingStatus,
  ViewportProps,
} from '@flowmap.blue/data';
import { DataProvider } from './WorkerDataProvider';

const dataProvider = wrap<DataProvider>(new WorkerDataProvider());

export type AppStore = {
  locationsStatus: LoadingStatus | undefined;
  flowsStatus: LoadingStatus | undefined;
  layersData: LoadingState<LayersData> | undefined;
  loadLocations: (locationsUrl: string) => Promise<void>;
  loadFlows: (locationsUrl: string) => Promise<void>;
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

export const appStore = createVanilla<AppStore>(
  (set, get): AppStore => {
    async function updateLayersData() {
      const { locationsStatus, flowsStatus } = get();
      if (locationsStatus === LoadingStatus.DONE && flowsStatus === LoadingStatus.DONE) {
        // set({ layersData: { status: LoadingStatus.LOADING }});
        try {
          const layersData = await dataProvider.getLayersData();
          // TODO: error handling
          set({ layersData: { status: LoadingStatus.DONE, data: layersData! } });
        } catch (err) {
          set({ layersData: { status: LoadingStatus.ERROR } });
        }
      } else {
        if (locationsStatus === LoadingStatus.ERROR || flowsStatus === LoadingStatus.ERROR) {
          set({ layersData: { status: LoadingStatus.ERROR } });
        }
      }
    }
    return {
      locationsStatus: undefined,
      flowsStatus: undefined,
      layersData: undefined,
      updateLayersData,
      // flowMapState: undefined,
      // setFlowMapState: async (flowMapState) => {
      //   const next = {
      //     ...flowMapState,
      //     viewport: pickViewportProps(flowMapState.viewport),
      //   };
      //   console.log(next);
      //   await dataProvider.setFlowMapState(next);
      //   await updateLayersData();
      // },

      //getInitialState(DEFAULT_CONFIG, [0,0], ''),
      // dispatch: async action => {
      //   console.log('store.dispatch',action);
      //   set(state => ({ flowMapState: mainReducer(state.flowMapState, action) }));
      //   await dataProvider.dispatch(action);
      // },
      loadLocations: async (locationsUrl) => {
        const { layersData } = get();
        set({
          layersData: { ...layersData, status: LoadingStatus.LOADING },
          locationsStatus: await dataProvider.loadLocations(locationsUrl),
        });
        await updateLayersData();
      },
      loadFlows: async (flowsUrl) => {
        const { layersData } = get();
        set({
          layersData: { ...layersData, status: LoadingStatus.LOADING },
          flowsStatus: await dataProvider.loadFlows(flowsUrl),
        });
        await updateLayersData();
      },

      getViewportForLocations: async (dims) => dataProvider.getViewportForLocations(dims),
    };
  }
);

export const useAppStore = create<AppStore>(appStore);
export const useFlowMapStore = createFlowMapStore();
useFlowMapStore.subscribe(
  throttle(
    async (flowMapState: FlowMapState) => {
      await dataProvider.setFlowMapState(flowMapState);
      // TODO: don't call if nothing relevant has changed in the state
      await appStore.getState().updateLayersData();
    },
    100,
    { leading: true, trailing: true }
  ),
  (state) => state.flowMapState
);
