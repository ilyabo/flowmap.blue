// http://localhost:7000/from-url?colors.darkMode=no&flows=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/flows.csv&locations=https://gist.githubusercontent.com/ilyabo/a7b9701424257146b571149d92a14926/raw/2e9e1e9bcf64cf0090781b451037229ccb78e1b1/locations.csv


import React, {FC, useEffect, useMemo} from 'react';
import {PromiseState} from 'react-refetch';
import FlowMap, { LoadingSpinner, MapContainer} from '@flowmap.blue/core';
import {ConfigPropName, DEFAULT_CONFIG} from '@flowmap.blue/data';
import {useLocation} from 'react-router-dom';
import * as queryString from 'query-string';
import ErrorFallback from './ErrorFallback';
import {LoadingStatus} from "@flowmap.blue/data";
import store, {Store} from './store';
import create from 'zustand';

const useStore = create<Store>(store);

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

  const loadLocations = useStore(state => state.loadLocations);
  const loadFlows = useStore(state => state.loadFlows);
  useEffect(() => { loadLocations(locationsUrl); }, [locationsUrl]);
  useEffect(() => { loadFlows(flowsUrl); }, [flowsUrl]);
  const layersData = useStore(state => state.layersData);

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


  if (!layersData || layersData?.status === LoadingStatus.LOADING) {
    return <LoadingSpinner />;
  }
  if (layersData?.status === LoadingStatus.ERROR) {
    return <ErrorFallback error="Couldn't load data" />;
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
      />}
    </MapContainer>
  );
};

export default FromUrlFlowMap;
