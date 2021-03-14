import {createLayersDataStore, FlowMapState, LayersData, LoadingStatus, ViewportProps} from './';
import * as Comlink from 'comlink';

const layersDataStore = createLayersDataStore();
const { getState, setState, subscribe, destroy } = layersDataStore;

export interface DataProvider {
  // dispatch(action: Action): void;
  setFlowMapState(flowMapState: FlowMapState): Promise<void>;
  loadLocations(locationsUrl: string): Promise<LoadingStatus>;
  loadFlows(flowsUrl: string): Promise<LoadingStatus>;
  getLayersData(): LayersData | undefined;
  getViewportForLocations: ([width,height]:[number,number]) => Promise<ViewportProps | undefined>;
}


export class WorkerDataProvider implements DataProvider {

  // async dispatch(action: Action) {
  //   console.log('WorkerDataProvider.dispatch',action);
  //   await getState().dispatch(action);
  // }

  async setFlowMapState(flowMapState: FlowMapState) {
    await setState({flowMapState});
  }

  async loadLocations(locationsUrl: string) {
    await getState().loadLocations(locationsUrl);
    return getState().locations!.status;
  }

  async loadFlows(flowsUrl: string) {
    await getState().loadFlows(flowsUrl);
    return getState().flows!.status;
  }

  async getViewportForLocations(dims:[number,number]) {
    return await getState().getViewportForLocations(dims);
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
