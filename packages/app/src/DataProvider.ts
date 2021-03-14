import {Action, FlowMapState, LayersData, LoadingStatus} from '@flowmap.blue/data';

export interface DataProvider {
  // dispatch(action: Action): void;
  setFlowMapState(flowMapState: FlowMapState): Promise<void>;
  loadLocations(locationsUrl: string): Promise<LoadingStatus>;
  loadFlows(flowsUrl: string): Promise<LoadingStatus>;
  getLayersData(): LayersData | undefined;
}
