import * as Comlink from 'comlink';
import create from 'zustand/vanilla';

/* eslint-disable import/no-webpack-loader-syntax */
import WorkerDataProvider from 'worker-loader!./WorkerDataProvider';
import {ColorsRGBA} from '@flowmap.gl/core';
import {LayersAttributes, LoadingState, LoadingStatus} from '@flowmap.blue/data';
import {DataProvider} from './DataProvider';

const workerDataProvider = new WorkerDataProvider();
const dataProvider = Comlink.wrap<DataProvider>(workerDataProvider);

export type Store = {
  locationsStatus: LoadingStatus | undefined;
  flowsStatus: LoadingStatus | undefined;
  layersData: LoadingState<LayersAttributes> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (locationsUrl: string) => void;
  // getFlowMapColorsRGBA(): ColorsRGBA;
  // getLayersData(): LayersAttributes | undefined;
};

export const store = create<Store>(
  (set, get): Store => {
    async function updateLayersData() {
      const {locationsStatus, flowsStatus} = get();
      if (locationsStatus === LoadingStatus.DONE && flowsStatus === LoadingStatus.DONE) {
        set({ layersData: { status: LoadingStatus.LOADING }});
        const layersData = await dataProvider.getLayersData();
        // TODO: error handling
        set({ layersData: { status: LoadingStatus.DONE, data: layersData! }});
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
      loadLocations: async (locationsUrl) => {
        set({ layersData: { status: LoadingStatus.LOADING} });
        const status = await dataProvider.loadLocations(locationsUrl);
        set({ locationsStatus: status });
        updateLayersData();
      },
      loadFlows: async (flowsUrl) => {
        set({ layersData: { status: LoadingStatus.LOADING }});
        const status = await dataProvider.loadFlows(flowsUrl);
        set({ flowsStatus: status });
        updateLayersData();
      },
    });
  }
)

export default store;
