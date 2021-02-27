import {csvParse, DSVRowString} from "d3-dsv";

export enum LoadingStatus {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  DONE = 'DONE',
}

export type LoadingState<T> =
  | { status: LoadingStatus.LOADING }
  | { status: LoadingStatus.ERROR }
  | { status: LoadingStatus.DONE; data: T };


export const fetchCsv = async<Row> (
  url: string,
  transformRow: (rawRow: DSVRowString, index: number, columns: string) => Row | undefined | null
): Promise<LoadingState<Row[]>> => {
  const response = await fetch(url);
  if (response.ok) {
    try {
      const text = await response.text();
      const data = csvParse<Row>(text,
        // @ts-ignore
        transformRow);
      return ({ status: LoadingStatus.DONE, data });
    } catch {
      return ({ status: LoadingStatus.ERROR });
    }
  } else {
    return ({ status: LoadingStatus.ERROR })
  }
};
