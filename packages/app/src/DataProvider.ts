import {LayersAttributes, LoadingStatus} from '@flowmap.blue/data';

export interface DataProvider {
  loadLocations(locationsUrl: string): Promise<LoadingStatus>;
  loadFlows(flowsUrl: string): Promise<LoadingStatus>;
  getLayersData(): LayersAttributes | undefined;
}
