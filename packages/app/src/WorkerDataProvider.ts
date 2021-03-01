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
    const layersData = getState().getLayersData();
    if (layersData) {
      //  Unlike pass-by-reference, the 'version' from the calling context is no longer available once
      //  transferred. Its ownership is transferred to the new context. For example, when transferring an
      //  ArrayBuffer from your main app to a worker script, the original ArrayBuffer is cleared and no
      //  longer usable. Its content is (quite literally) transferred to the worker context.
      const transfers = [
        ...Object.values(layersData.circleAttributes.attributes).map(v => v.value.buffer),
        ...Object.values(layersData.lineAttributes.attributes).map(v => v.value.buffer),
      ];
      return Comlink.transfer(
        layersData,
        transfers
      );
    }
    return layersData;
  }
}

Comlink.expose(new WorkerDataProvider());
