import {LocationFilterMode, ViewportProps} from './types';

export interface BaseState {
  viewport: ViewportProps;
  adjustViewportToLocations: boolean;
  selectedLocations: string[] | undefined;
  selectedTimeRange: [Date, Date] | undefined;
  locationFilterMode: LocationFilterMode;
  animationEnabled: boolean;
  fadeEnabled: boolean;
  locationTotalsEnabled: boolean;
  adaptiveScalesEnabled: boolean;
  clusteringEnabled: boolean;
  clusteringAuto: boolean;
  manualClusterZoom?: number;
  baseMapEnabled: boolean;
  darkMode: boolean;
  fadeAmount: number;
  baseMapOpacity: number;
  colorSchemeKey: string | undefined;
  selectedFlowsSheet: string | undefined;
}
