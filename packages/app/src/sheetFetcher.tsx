import { connect } from 'react-refetch';
import { csvParse } from 'd3-dsv';
import {getSheetDataAsArray, parseGsheetsJson, SheetData} from '@flowmap.blue/data';

// TODO: use LRU cache
const cache = new Map();

const sheetFetcher = (format: 'csv' | 'json') =>
  connect.defaults({
    fetch: ((input: RequestInfo, init: RequestInit) => {
      const req = new Request(input, init);

      const key = `${req.url}`; // TODO: add body for POST requests
      const cached = cache.get(key);

      if (cached) {
        return new Promise((resolve) => resolve(cached.response.clone()));
      }
      req.headers.set('Content-Type', 'text/plain'); // to avoid slow CORS pre-flight requests
      return fetch(req).then((response) => {
        cache.set(key, {
          response: response.clone(),
        });
        return response;
      });
    }) as any,

    handleResponse: function (response) {
      if (response.headers.get('content-length') === '0' || response.status === 204) {
        return;
      }
      const text = response.text();
      if (response.status >= 200 && response.status < 300) {
        return text.then(
          (text: string) =>
            new Promise((resolve, reject) => {
              let rows;
              try {
                switch (format) {
                  case 'json':
                    const json = parseGsheetsJson(text) as SheetData;
                    rows = getSheetDataAsArray(json);
                    if (json.status !== 'ok') {
                      throw new Error(`Error loading data from Google Sheets`);
                    }
                    break;
                  case 'csv':
                    rows = csvParse(text);
                    break;
                }
                resolve(rows);
              } catch (err) {
                console.error(err);
                reject(err);
              }
            })
        );
      } else {
        return text.then((cause: any) => Promise.reject(new Error(cause)));
      }
    },
  });

export default sheetFetcher;
