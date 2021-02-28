import {createDataStore} from '@flowmap.blue/data';
import * as Comlink from 'comlink';
import {DataProvider} from './DataProvider';

const dataStore = createDataStore();
const { getState, setState, subscribe, destroy } = dataStore;



export class WorkerDataProvider implements DataProvider {
  async loadLocations(locationsUrl: string) {
    await getState().loadLocations(locationsUrl);
    return getState().locations!.status;
  }

  async loadFlows(flowsUrl: string) {
    await getState().loadFlows(flowsUrl);
    return getState().flows!.status;
  }

  getLayersData() {
    return getState().getLayersData();
  }
}

Comlink.expose(new WorkerDataProvider());
