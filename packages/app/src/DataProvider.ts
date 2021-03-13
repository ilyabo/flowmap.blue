import {Action, LayersData, LoadingStatus} from '@flowmap.blue/data';

export interface DataProvider {
  dispatch(action: Action): void;
  loadLocations(locationsUrl: string): Promise<LoadingStatus>;
  loadFlows(flowsUrl: string): Promise<LoadingStatus>;
  getLayersData(): LayersData | undefined;
}
