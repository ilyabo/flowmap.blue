import create from 'zustand';
import {Flow,Location} from "@flowmap.gl/core";

import * as Comlink from 'comlink';
/* eslint-disable import/no-webpack-loader-syntax */
import DataProviderWorker from 'worker-loader!./FlowMapWorkerDataProvider';
import {FlowMapWorkerDataProvider} from './FlowMapWorkerDataProvider';
import {LoadingState} from "@flowmap.blue/data";

const worker = new DataProviderWorker();
const dataProvider = Comlink.wrap<FlowMapWorkerDataProvider>(worker);


export type Store = {
  locations: LoadingState<Location[]> | undefined;
  flows: LoadingState<Flow[]> | undefined;
  loadLocations: (locationsUrl: string) => void;
  loadFlows: (flowsUrl: string) => void;
}


export const useStore = create<Store>(
  (set): Store => ({
    locations: undefined,
    flows: undefined,
    loadLocations: async (locationsUrl) => {
      const locations = await dataProvider.loadLocations(locationsUrl);
      console.log(locations)
      set({locations});
    },
    loadFlows: async (flowsUrl) => {
      const flows = await dataProvider.loadFlows(flowsUrl);
      console.log(flows)
      set({flows});
    },
  })
)