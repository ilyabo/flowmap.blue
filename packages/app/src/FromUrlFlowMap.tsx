// http://localhost:7000/from-url?colors.darkMode=no&flows=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/flows.csv&locations=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/locations.csv
// http://localhost:7000/from-url?v=46.735655191986154,8.172725132201116,6.657&colors.darkMode=no&flows=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/flows.csv&locations=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/locations.csv
// Personenverkehr in der Schweiz - PW  http://localhost:7000/from-url?colors.darkMode=no&flows=https%3A//docs.google.com/spreadsheets/d/e/2PACX-1vRYROhHQxi_WCFs0spjfJ3do4z2eD61dXhM4Lml0Ty3YN4pqCWfDitMCnYgKc8Zt2B6ge4xGg-xUdqB/pub%3Fgid%3D1812990135%26single%3Dtrue%26output%3Dcsv&locations=https%3A//docs.google.com/spreadsheets/d/e/2PACX-1vRYROhHQxi_WCFs0spjfJ3do4z2eD61dXhM4Lml0Ty3YN4pqCWfDitMCnYgKc8Zt2B6ge4xGg-xUdqB/pub%3Fgid%3D877058976%26single%3Dtrue%26output%3Dcsv
// Personenverkehr in der Schweiz - Velo  http://localhost:7000/from-url?colors.darkMode=no&flows=https%3A//docs.google.com/spreadsheets/d/e/2PACX-1vRYROhHQxi_WCFs0spjfJ3do4z2eD61dXhM4Lml0Ty3YN4pqCWfDitMCnYgKc8Zt2B6ge4xGg-xUdqB/pub%3Fgid%3D229626141%26single%3Dtrue%26output%3Dcsv&locations=https%3A//docs.google.com/spreadsheets/d/e/2PACX-1vRYROhHQxi_WCFs0spjfJ3do4z2eD61dXhM4Lml0Ty3YN4pqCWfDitMCnYgKc8Zt2B6ge4xGg-xUdqB/pub%3Fgid%3D877058976%26single%3Dtrue%26output%3Dcsv

import React, {FC, useEffect, useMemo} from 'react';
import FlowMap, {LoadingSpinner, MapContainer} from '@flowmap.blue/core';
import {
  ActionType,
  ConfigPropName,
  DEFAULT_CONFIG,
  FlowMapStore,
  getInitialState,
  LoadingStatus
} from '@flowmap.blue/data';
import {useHistory, useLocation} from 'react-router-dom';
import * as queryString from 'query-string';
import ErrorFallback from './ErrorFallback';
import {useAppStore, useFlowMapStore} from './AppStore';


// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return queryString.parse(useLocation().search);
}

const FromUrlFlowMap: FC<{}> = (props: {}) => {
  const params = useQuery();
  if (typeof params.locations !== 'string') {
    throw new Error(`Invalid locations URL`);
  }
  if (typeof params.flows !== 'string') {
    throw new Error(`Invalid flows URL`);
  }
  const locationsUrl = params.locations as string;
  const flowsUrl = params.flows as string;


  const history = useHistory();
  const setFlowMapState = useFlowMapStore(state => state.setFlowMapState);
  const adjustViewportToLocations = useFlowMapStore(state => state.flowMapState.adjustViewportToLocations);
  // const dispatch = useFlowMapStore(state => state.dispatch);
  const getViewportForLocations = useAppStore(state => state.getViewportForLocations);
  const layersData = useAppStore(state => state.layersData);
  const loadLocations = useAppStore(state => state.loadLocations);
  const loadFlows = useAppStore(state => state.loadFlows);
  useEffect(() => { loadLocations(locationsUrl); }, [locationsUrl]);
  useEffect(() => { loadFlows(flowsUrl); }, [flowsUrl]);

  const config = useMemo(() => {
    const config = { ...DEFAULT_CONFIG };
    for (const prop of Object.values(ConfigPropName)) {
      const val = params[prop];
      if (typeof(val) === 'string' && val.length > 0) {
        config[prop] = val;
      }
    }
    return config;
  }, [params]);


  useEffect(() => {
    if (layersData?.status === LoadingStatus.DONE && adjustViewportToLocations) {
      (async function() {
        const dims: [number, number] = [window.innerWidth, window.innerHeight];
        const viewport = await getViewportForLocations(dims);
        setFlowMapState({
          ...getInitialState(config, dims, history.location.search),
          viewport: viewport!,
          adjustViewportToLocations: false,
        });
      })();
    }
  }, [layersData?.status, adjustViewportToLocations]);

  if (layersData?.status === LoadingStatus.ERROR) {
    return <ErrorFallback error="Failed to fetch data" />;
  }

  return (
    <MapContainer>
      {layersData &&
      <FlowMap
        inBrowser={true}
        flowsSheet={undefined}
        layersData={layersData}
        config={config}
        spreadSheetKey={undefined}
        useFlowMapStore={useFlowMapStore}
      />}
    </MapContainer>
  );
};

export default FromUrlFlowMap;
