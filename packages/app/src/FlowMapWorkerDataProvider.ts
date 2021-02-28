import * as Comlink from 'comlink';
import {fetchCsv, LoadingStatus, prepareFlows} from '@flowmap.blue/data';
import {getColorsRGBA, getDiffColorsRGBA, isDiffColors} from '@flowmap.gl/core';

export class FlowMapWorkerDataProvider {
  async loadLocations(locationsUrl: string) {
    const result = await fetchCsv(locationsUrl,
      (row) => ({
        ...row,
        lat: Number(row.lat),
        lon: Number(row.lon),
      })
    );
    return result;
  }

  async loadFlows(flowsUrl: string) {
    const result = await fetchCsv(flowsUrl,
      (row: any) => ({
        ...row,
        count: +row.count,
      })
    );
    if (result.status === LoadingStatus.DONE) {
      return { ...result, data: prepareFlows(result.data) };
    }
    return result;
  }


  // getLayersData() {
  //
  //   const flowMapColors = getFlowMapColors(state, props);
  //   const flowMapColorsRGBA = useMemo(() =>
  //     isDiffColors(flowMapColors)
  //       ? getDiffColorsRGBA(flowMapColors)
  //       : getColorsRGBA(flowMapColors), [flowMapColors]);
  //
  //   const layersData = useMemo(
  //     () => locations && flows ? prepareLayersData(locations, flows, flowMapColorsRGBA) : undefined,
  //     [ locations, flows, flowMapColorsRGBA ]);
  //
  // }
}



Comlink.expose(new FlowMapWorkerDataProvider());


