import {Action, FlowMapState, LayersData, LoadingStatus, ViewportProps} from './';

export interface DataProvider {
  // dispatch(action: Action): void;
  setFlowMapState(flowMapState: FlowMapState): Promise<void>;
  loadLocations(locationsUrl: string): Promise<LoadingStatus>;
  loadFlows(flowsUrl: string): Promise<LoadingStatus>;
  getLayersData(): LayersData | undefined;
  getViewportForLocations: () => Promise<ViewportProps | undefined>;
}
