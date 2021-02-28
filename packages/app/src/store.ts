import * as Comlink from 'comlink';
import create from 'zustand/vanilla';

import {Store} from '@flowmap.blue/data';

/* eslint-disable import/no-webpack-loader-syntax */
import WorkerDataProvider from 'worker-loader!./WorkerDataProvider';

const workerDataProvider = new WorkerDataProvider();
const remoteStore = Comlink.wrap<Store>(workerDataProvider);


export const store = create<Store>(
  (set): Store => ({
    locations: undefined,
    flows: undefined,
    loadLocations: async (locationsUrl) => {
      const locations = await remoteStore.loadLocations(locationsUrl);
      console.log(locations)
      // @ts-ignore
      set({locations});
    },
    loadFlows: async (flowsUrl) => {
      const flows = await remoteStore.loadFlows(flowsUrl);
      console.log(flows)
      // @ts-ignore
      set({flows});
    },
  })
)

export default store;
