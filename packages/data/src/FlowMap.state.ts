import { Config, ConfigPropName, Flow, LocationFilterMode, ViewportProps, TooltipProps } from './';
import * as queryString from 'query-string';
import { viewport } from '@mapbox/geo-viewport';
import { COLOR_SCHEME_KEYS, parseBoolConfigProp, parseNumberConfigProp } from './';
import { csvFormatRows, csvParseRows } from 'd3-dsv';
import { timeFormat, timeParse } from 'd3-time-format';

export const MAX_ZOOM_LEVEL = 20;
export const MIN_ZOOM_LEVEL = 0;
export const MIN_PITCH = 0;
export const MAX_PITCH = +60;

const TIME_QUERY_FORMAT = '%Y%m%dT%H%M%S';
const timeToQuery = timeFormat(TIME_QUERY_FORMAT);
const timeFromQuery = timeParse(TIME_QUERY_FORMAT);

export function mapTransition() {
  return {
    transitionDuration: 0,
    // transitionInterpolator: new FlyToInterpolator(),
    // transitionEasing: easeCubic,
    transitionInterpolator: undefined,
    transitionEasing: undefined,
  };
}
export enum HighlightType {
  LOCATION = 'location',
  FLOW = 'flow',
}

export interface LocationHighlight {
  type: HighlightType.LOCATION;
  locationId: string;
}

export interface FlowHighlight {
  type: HighlightType.FLOW;
  flow: Flow;
}

export type Highlight = LocationHighlight | FlowHighlight;

export interface FlowMapState {
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
  tooltip?: TooltipProps;
  highlight?: Highlight;
}

export enum ActionType {
  SET_VIEWPORT = 'SET_VIEWPORT',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  RESET_BEARING_PITCH = 'RESET_BEARING_PITCH',
  SET_HIGHLIGHT = 'SET_HIGHLIGHT',
  SET_TOOLTIP = 'SET_TOOLTIP',
  CLEAR_SELECTION = 'CLEAR_SELECTION',
  SELECT_LOCATION = 'SELECT_LOCATION',
  SET_SELECTED_LOCATIONS = 'SET_SELECTED_LOCATIONS',
  SET_LOCATION_FILTER_MODE = 'SET_LOCATION_FILTER_MODE',
  SET_TIME_RANGE = 'SET_TIME_RANGE',
  SET_CLUSTERING_ENABLED = 'SET_CLUSTERING_ENABLED',
  SET_CLUSTERING_AUTO = 'SET_CLUSTERING_AUTO',
  SET_MANUAL_CLUSTER_ZOOM = 'SET_MANUAL_CLUSTER_ZOOM',
  SET_ANIMATION_ENABLED = 'SET_ANIMATION_ENABLED',
  SET_LOCATION_TOTALS_ENABLED = 'SET_LOCATION_TOTALS_ENABLED',
  SET_ADAPTIVE_SCALES_ENABLED = 'SET_ADAPTIVE_SCALES_ENABLED',
  SET_DARK_MODE = 'SET_DARK_MODE',
  SET_FADE_ENABLED = 'SET_FADE_ENABLED',
  SET_BASE_MAP_ENABLED = 'SET_BASE_MAP_ENABLED',
  SET_FADE_AMOUNT = 'SET_FADE_AMOUNT',
  SET_BASE_MAP_OPACITY = 'SET_BASE_MAP_OPACITY',
  SET_COLOR_SCHEME = 'SET_COLOR_SCHEME',
}

export type Action =
  | {
      type: ActionType.SET_VIEWPORT;
      viewport: ViewportProps;
      adjustViewportToLocations?: boolean;
    }
  | {
      type: ActionType.ZOOM_IN;
    }
  | {
      type: ActionType.ZOOM_OUT;
    }
  | {
      type: ActionType.RESET_BEARING_PITCH;
    }
  | {
      type: ActionType.SET_HIGHLIGHT;
      highlight: Highlight | undefined;
    }
  | {
      type: ActionType.CLEAR_SELECTION;
    }
  | {
      type: ActionType.SELECT_LOCATION;
      locationId: string;
      incremental: boolean;
    }
  | {
      type: ActionType.SET_SELECTED_LOCATIONS;
      selectedLocations: string[] | undefined;
    }
  | {
      type: ActionType.SET_LOCATION_FILTER_MODE;
      mode: LocationFilterMode;
    }
  | {
      type: ActionType.SET_TIME_RANGE;
      range: [Date, Date];
    }
  | {
      type: ActionType.SET_TOOLTIP;
      tooltip: TooltipProps | undefined;
    }
  | {
      type: ActionType.SET_CLUSTERING_ENABLED;
      clusteringEnabled: boolean;
    }
  | {
      type: ActionType.SET_CLUSTERING_AUTO;
      clusteringAuto: boolean;
    }
  | {
      type: ActionType.SET_ANIMATION_ENABLED;
      animationEnabled: boolean;
    }
  | {
      type: ActionType.SET_LOCATION_TOTALS_ENABLED;
      locationTotalsEnabled: boolean;
    }
  | {
      type: ActionType.SET_ADAPTIVE_SCALES_ENABLED;
      adaptiveScalesEnabled: boolean;
    }
  | {
      type: ActionType.SET_DARK_MODE;
      darkMode: boolean;
    }
  | {
      type: ActionType.SET_FADE_ENABLED;
      fadeEnabled: boolean;
    }
  | {
      type: ActionType.SET_BASE_MAP_ENABLED;
      baseMapEnabled: boolean;
    }
  | {
      type: ActionType.SET_FADE_AMOUNT;
      fadeAmount: number;
    }
  | {
      type: ActionType.SET_BASE_MAP_OPACITY;
      baseMapOpacity: number;
    }
  | {
      type: ActionType.SET_MANUAL_CLUSTER_ZOOM;
      manualClusterZoom: number | undefined;
    }
  | {
      type: ActionType.SET_COLOR_SCHEME;
      colorSchemeKey: string;
    };

export function mainReducer(state: FlowMapState, action: Action): FlowMapState {
  switch (action.type) {
    case ActionType.SET_VIEWPORT: {
      const { viewport, adjustViewportToLocations } = action;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, viewport.zoom)),
          ...mapTransition(),
        },
        tooltip: undefined,
        highlight: undefined,
        ...(adjustViewportToLocations != null && {
          adjustViewportToLocations: false,
        }),
      };
    }
    case ActionType.ZOOM_IN: {
      const { viewport } = state;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.min(MAX_ZOOM_LEVEL, viewport.zoom * 1.1),
          ...mapTransition(),
        },
        tooltip: undefined,
        highlight: undefined,
      };
    }
    case ActionType.ZOOM_OUT: {
      const { viewport } = state;
      return {
        ...state,
        viewport: {
          ...viewport,
          zoom: Math.max(MIN_ZOOM_LEVEL, viewport.zoom / 1.1),
          ...mapTransition(),
        },
        tooltip: undefined,
        highlight: undefined,
      };
    }
    case ActionType.RESET_BEARING_PITCH: {
      const { viewport } = state;
      return {
        ...state,
        viewport: {
          ...viewport,
          bearing: 0,
          pitch: 0,
          ...mapTransition(),
        },
      };
    }
    case ActionType.SET_HIGHLIGHT: {
      const { highlight } = action;
      return {
        ...state,
        highlight,
      };
    }
    case ActionType.SET_TOOLTIP: {
      const { tooltip } = action;
      return {
        ...state,
        tooltip,
      };
    }
    case ActionType.CLEAR_SELECTION: {
      return {
        ...state,
        selectedLocations: undefined,
        locationFilterMode: LocationFilterMode.ALL,
        highlight: undefined,
        tooltip: undefined,
      };
    }
    case ActionType.SET_SELECTED_LOCATIONS: {
      const { selectedLocations } = action;
      const isEmpty = !selectedLocations || selectedLocations.length === 0;
      if (isEmpty) {
        return {
          ...state,
          locationFilterMode: LocationFilterMode.ALL,
          selectedLocations: undefined,
        };
      }
      return {
        ...state,
        selectedLocations,
      };
    }
    case ActionType.SET_LOCATION_FILTER_MODE: {
      const { mode } = action;
      return {
        ...state,
        locationFilterMode: mode,
      };
    }
    case ActionType.SET_TIME_RANGE: {
      const { range } = action;
      return {
        ...state,
        selectedTimeRange: range,
      };
    }
    case ActionType.SELECT_LOCATION: {
      const { selectedLocations } = state;
      const { locationId, incremental } = action;
      let nextSelectedLocations;
      if (selectedLocations) {
        const idx = selectedLocations.findIndex((id) => id === locationId);
        if (idx >= 0) {
          nextSelectedLocations = selectedLocations.slice();
          nextSelectedLocations.splice(idx, 1);
          if (nextSelectedLocations.length === 0) nextSelectedLocations = undefined;
        } else {
          if (incremental) {
            nextSelectedLocations = [...selectedLocations, locationId];
          } else {
            nextSelectedLocations = [locationId];
          }
        }
      } else {
        nextSelectedLocations = [locationId];
      }
      return {
        ...state,
        selectedLocations: nextSelectedLocations,
        ...(!nextSelectedLocations && {
          locationFilterMode: LocationFilterMode.ALL,
        }),
        highlight: undefined,
        tooltip: undefined,
      };
    }
    case ActionType.SET_CLUSTERING_ENABLED: {
      const { clusteringEnabled } = action;
      return {
        ...state,
        clusteringEnabled,
      };
    }
    case ActionType.SET_CLUSTERING_AUTO: {
      const { clusteringAuto } = action;
      return {
        ...state,
        clusteringAuto,
      };
    }
    case ActionType.SET_ANIMATION_ENABLED: {
      const { animationEnabled } = action;
      return {
        ...state,
        animationEnabled,
      };
    }
    case ActionType.SET_LOCATION_TOTALS_ENABLED: {
      const { locationTotalsEnabled } = action;
      return {
        ...state,
        locationTotalsEnabled,
      };
    }
    case ActionType.SET_ADAPTIVE_SCALES_ENABLED: {
      const { adaptiveScalesEnabled } = action;
      return {
        ...state,
        adaptiveScalesEnabled,
      };
    }
    case ActionType.SET_DARK_MODE: {
      const { darkMode } = action;
      return {
        ...state,
        darkMode,
      };
    }
    case ActionType.SET_FADE_ENABLED: {
      const { fadeEnabled } = action;
      return {
        ...state,
        fadeEnabled,
      };
    }
    case ActionType.SET_BASE_MAP_ENABLED: {
      const { baseMapEnabled } = action;
      return {
        ...state,
        baseMapEnabled,
      };
    }
    case ActionType.SET_FADE_AMOUNT: {
      const { fadeAmount } = action;
      return {
        ...state,
        fadeAmount,
      };
    }
    case ActionType.SET_BASE_MAP_OPACITY: {
      const { baseMapOpacity } = action;
      return {
        ...state,
        baseMapOpacity,
      };
    }
    case ActionType.SET_MANUAL_CLUSTER_ZOOM: {
      const { manualClusterZoom } = action;
      return {
        ...state,
        manualClusterZoom,
      };
    }
    case ActionType.SET_COLOR_SCHEME: {
      const { colorSchemeKey } = action;
      return {
        ...state,
        colorSchemeKey,
      };
    }
  }
  return state;
}

export const reducer /*: Reducer<State, Action>*/ = (state: FlowMapState, action: Action) => {
  const nextState = mainReducer(state, action);
  // console.log(action.type, action);
  return nextState;
};

export function asNumber(v: string | string[] | null | undefined): number | undefined {
  if (typeof v === 'string') {
    const val = +v;
    if (!isNaN(val) && isFinite(val)) return val;
  }
  return undefined;
}

export function asBoolean(v: string | string[] | null | undefined): boolean | undefined {
  if (v === '1' || v === '0') {
    return v === '1';
  }
  return undefined;
}

export function applyStateFromQueryString(draft: FlowMapState, query: string) {
  const params = queryString.parse(query.substr(1));
  if (typeof params.s === 'string') {
    const rows = csvParseRows(params.s);
    if (rows.length > 0) {
      draft.selectedLocations = rows[0];
    }
  }
  if (typeof params.v === 'string') {
    const rows = csvParseRows(params.v);
    if (rows.length > 0) {
      const [latitude, longitude, zoom, bearing, pitch] = rows[0].map(asNumber);
      if (latitude != null && longitude != null && zoom != null) {
        draft.viewport = {
          ...draft.viewport,
          latitude,
          longitude,
          zoom,
          ...(bearing != null ? { bearing } : undefined),
          ...(pitch != null ? { pitch } : undefined),
        };
        draft.adjustViewportToLocations = false;
      }
    }
  }
  draft.baseMapOpacity = asNumber(params.bo) ?? draft.baseMapOpacity;
  draft.manualClusterZoom = asNumber(params.cz) ?? draft.manualClusterZoom;
  draft.baseMapEnabled = asBoolean(params.b) ?? draft.baseMapEnabled;
  draft.darkMode = asBoolean(params.d) ?? draft.darkMode;
  draft.fadeEnabled = asBoolean(params.fe) ?? draft.fadeEnabled;
  draft.fadeAmount = asNumber(params.f) ?? draft.fadeAmount;
  draft.animationEnabled = asBoolean(params.a) ?? draft.animationEnabled;
  draft.adaptiveScalesEnabled = asBoolean(params.as) ?? draft.adaptiveScalesEnabled;
  draft.clusteringEnabled = asBoolean(params.c) ?? draft.clusteringEnabled;
  draft.clusteringAuto = asBoolean(params.ca) ?? draft.clusteringAuto;
  draft.locationTotalsEnabled = asBoolean(params.lt) ?? draft.locationTotalsEnabled;
  if (params.lfm != null && (params.lfm as string) in LocationFilterMode) {
    draft.locationFilterMode = params.lfm as LocationFilterMode;
  }
  if (typeof params.t === 'string') {
    const parts = params.t.split(',');
    const t1 = timeFromQuery(parts[0]);
    const t2 = timeFromQuery(parts[1]);
    if (t1 && t2) {
      draft.selectedTimeRange = [t1, t2];
    }
  }
  if (typeof params.col === 'string' && COLOR_SCHEME_KEYS.includes(params.col)) {
    draft.colorSchemeKey = params.col;
  }
}

export function stateToQueryString(state: FlowMapState) {
  const parts: string[] = [];
  const {
    viewport: { latitude, longitude, zoom, bearing, pitch },
    selectedLocations,
  } = state;
  parts.push(
    `v=${csvFormatRows([
      [
        latitude.toFixed(6),
        longitude.toFixed(6),
        zoom.toFixed(2),
        bearing.toFixed(0),
        pitch.toFixed(0),
      ],
    ])}`
  );
  parts.push(`a=${state.animationEnabled ? 1 : 0}`);
  parts.push(`as=${state.adaptiveScalesEnabled ? 1 : 0}`);
  parts.push(`b=${state.baseMapEnabled ? 1 : 0}`);
  parts.push(`bo=${state.baseMapOpacity}`);
  parts.push(`c=${state.clusteringEnabled ? 1 : 0}`);
  parts.push(`ca=${state.clusteringAuto ? 1 : 0}`);
  if (state.manualClusterZoom != null) parts.push(`cz=${state.manualClusterZoom}`);
  parts.push(`d=${state.darkMode ? 1 : 0}`);
  parts.push(`fe=${state.fadeEnabled ? 1 : 0}`);
  parts.push(`lt=${state.locationTotalsEnabled ? 1 : 0}`);
  parts.push(`lfm=${state.locationFilterMode}`);
  if (state.selectedTimeRange) {
    parts.push(`t=${state.selectedTimeRange.map(timeToQuery)}`);
  }
  if (state.colorSchemeKey != null) {
    parts.push(`col=${state.colorSchemeKey}`);
  }
  parts.push(`f=${state.fadeAmount}`);
  if (selectedLocations) {
    parts.push(`s=${encodeURIComponent(csvFormatRows([selectedLocations]))}`);
  }
  return parts.join('&');
}

export function getInitialViewport(
  [width, height]: [number, number],
  bbox: [number, number, number, number]
) {
  const {
    center: [longitude, latitude],
    zoom,
  } = viewport(bbox, [width, height], undefined, undefined, 512, true);
  return {
    width,
    height,
    longitude,
    latitude,
    zoom,
    minZoom: MIN_ZOOM_LEVEL,
    maxZoom: MAX_ZOOM_LEVEL,
    minPitch: MIN_PITCH,
    maxPitch: MAX_PITCH,
    bearing: 0,
    pitch: 0,
    altitude: 1.5,
  };
}

export function getInitialState(config: Config, dims: [number, number], queryString: string) {
  const draft = {
    viewport: getInitialViewport(dims, [-180, -70, 180, 70]),
    adjustViewportToLocations: true,
    selectedLocations: undefined,
    locationTotalsEnabled: true,
    locationFilterMode: LocationFilterMode.ALL,
    baseMapEnabled: true,
    adaptiveScalesEnabled: true,
    animationEnabled: parseBoolConfigProp(config[ConfigPropName.ANIMATE_FLOWS]),
    clusteringEnabled: parseBoolConfigProp(config[ConfigPropName.CLUSTER_ON_ZOOM] || 'true'),
    manualClusterZoom: undefined,
    fadeEnabled: true,
    clusteringAuto: true,
    darkMode: parseBoolConfigProp(config[ConfigPropName.COLORS_DARK_MODE] || 'true'),
    fadeAmount: parseNumberConfigProp(config[ConfigPropName.FADE_AMOUNT], 50),
    baseMapOpacity: parseNumberConfigProp(config[ConfigPropName.BASE_MAP_OPACITY], 75),
    colorSchemeKey: config[ConfigPropName.COLORS_SCHEME],
    selectedFlowsSheet: undefined,
    selectedTimeRange: undefined,
  };

  const bbox = config[ConfigPropName.MAP_BBOX];
  if (bbox) {
    const bounds = bbox
      .split(',')
      .map(asNumber)
      .filter((v) => v != null) as number[];
    if (bounds.length === 4) {
      draft.viewport = getInitialViewport(dims, bounds as [number, number, number, number]);
      draft.adjustViewportToLocations = false;
    }
  }

  if (queryString && queryString.length > 1) {
    applyStateFromQueryString(draft, queryString);
  }
  return draft;
}
