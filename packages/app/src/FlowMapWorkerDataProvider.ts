import * as Comlink from 'comlink';
import {fetchCsv, LoadingStatus, prepareFlows} from '@flowmap.blue/data';

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
}



Comlink.expose(new FlowMapWorkerDataProvider());


