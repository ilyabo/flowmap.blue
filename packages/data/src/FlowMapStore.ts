import {Action, FlowMapState} from '@flowmap.blue/data';

export type Store = {
  dispatch: (action: Action) => void;
  flowMapState: FlowMapState;
};