import React from 'react';
import useFetch from 'react-fetch-hook';
import { PromiseState } from 'react-refetch';
import FlowMap, { ConfigPropName, DEFAULT_CONFIG, LoadingSpinner, MapContainer, prepareFlows } from '@flowmap.blue/core';
import { csvParse } from 'd3-dsv';
import { useLocation } from 'react-router-dom';
import * as queryString from 'query-string';
import ErrorFallback from './ErrorFallback';
import { useMemo } from 'react';

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return queryString.parse(useLocation().search);
}

const FromUrlFlowMap = (props: {}) => {
  const params = useQuery();
  const locationsUrl = params.locations;
  const flowsUrl = params.flows;
  if (typeof locationsUrl !== 'string') {
    throw new Error(`Invalid locations URL`);
  }
  if (typeof flowsUrl !== 'string') {
    throw new Error(`Invalid flows URL`);
  }

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

  const fetchFlows = useFetch(flowsUrl, {
    formatter: (response) =>
      response.text().then((text) =>
        csvParse(text, (row: any) => ({
          ...row,
          count: +row.count,
        }))
      ),
  });
  const fetchLocations = useFetch(locationsUrl, {
    formatter: (response) =>
      response.text().then((text) =>
        csvParse(text, (row: any) => ({
          ...row,
          lat: +row.lat,
          lon: +row.lon,
        }))
      ),
  });

  if (fetchLocations.error) {
    return <ErrorFallback error={fetchLocations.error} />;
  }

  if (fetchFlows.error) {
    return <ErrorFallback error={fetchFlows.error} />;
  }

  if (fetchLocations.isLoading || fetchFlows.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <MapContainer>
      <FlowMap
        inBrowser={true}
        flowsSheet={undefined}
        flowsFetch={PromiseState.resolve(prepareFlows(fetchFlows.data as any[]))}
        locationsFetch={PromiseState.resolve(fetchLocations.data)}
        config={config}
        spreadSheetKey={undefined}
      />
    </MapContainer>
  );
};

export default FromUrlFlowMap;
