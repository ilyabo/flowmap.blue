import {createStore} from '@flowmap.blue/data';
import * as Comlink from 'comlink';

const dataStore = createStore();
const { getState, setState, subscribe, destroy } = dataStore;
// Comlink.expose(store);



export class WorkerDataProvider {
  async loadLocations(locationsUrl: string) {
    await getState().loadLocations(locationsUrl);
    return getState().locations;
  }

  async loadFlows(flowsUrl: string) {
    await getState().loadFlows(flowsUrl);
    return getState().flows;
  }


  // getLayersData() {
  //
  //   const flowMapColors = getFlowMapColors(state, props);
  //   const flowMapColorsRGBA = useMemo(() =>
  //     isDiffColors(flowMapColors)
  //       ? getDiffColorsRGBA(flowMapColors)
  //       : getColorsRGBA(flowMapColors), [flowMapColors]);
  //
  //   const layersData = useMemo(
  //     () => locations && flows ? prepareLayersData(locations, flows, flowMapColorsRGBA) : undefined,
  //     [ locations, flows, flowMapColorsRGBA ]);
  //
  // }
}

Comlink.expose(new WorkerDataProvider());
