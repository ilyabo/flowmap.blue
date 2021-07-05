import * as React from 'react';
import { useEffect, useState } from 'react';
import { AppToaster, LoadingSpinner, MapContainer } from '@flowmap.blue/core';
import {
  ConfigProp,
  ConfigPropName,
  DEFAULT_CONFIG,
  getFlowsSheets,
  makeSheetQueryUrl,
} from '@flowmap.blue/data';
import { Helmet } from 'react-helmet';
import sendEvent from './ga';
import { useAsync } from 'react-use';
import { csvParse } from 'd3-dsv';
import { Intent } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import md5 from 'blueimp-md5';
import { useHistory } from 'react-router-dom';
import styled from '@emotion/styled';
import FromUrlFlowMap from './FromUrlFlowMap';

interface Props {
  spreadSheetKey: string;
  flowsSheetKey?: string;
  embed: boolean;
}

const ToastContent = styled.div`
  font-size: 12px;
`;

const getFlowsSheetKey = (name: string) => md5(name).substr(0, 7);

const GSheetsFlowMap: React.FC<Props> = ({ spreadSheetKey, flowsSheetKey, embed }) => {
  const url = makeSheetQueryUrl(spreadSheetKey, 'properties', 'SELECT A,B', 'csv');
  const [flowsSheet, setFlowsSheet] = useState<string>('flows');
  const history = useHistory();

  const handleChangeFlowsSheet = (name: string, replaceUrl: boolean) => {
    if (replaceUrl) {
      history.replace({
        ...history.location,
        pathname: `/${spreadSheetKey}/${getFlowsSheetKey(name)}${embed ? '/embed' : ''}`,
      });
    }
    setFlowsSheet(name);
  };

  const configFetch = useAsync(async () => {
    const response = await fetch(url);
    const rows = csvParse(await response.text()) as ConfigProp[];
    const configProps = { ...DEFAULT_CONFIG };
    for (const prop of rows) {
      if (prop.value != null && `${prop.value}`.length > 0) {
        configProps[prop.property] = prop.value;
      }
    }
    sendEvent(
      `${spreadSheetKey} "${configProps[ConfigPropName.TITLE] || 'Untitled'}"`,
      `Load config`,
      `Load config "${configProps[ConfigPropName.TITLE] || 'Untitled'}"`
    );

    const flowsSheets = getFlowsSheets(configProps);
    if (flowsSheets && flowsSheets.length > 0) {
      let name = undefined;
      if (flowsSheetKey) {
        name = flowsSheets.find((fs) => getFlowsSheetKey(fs) === flowsSheetKey);
      } else {
        name = flowsSheets[0];
      }
      if (name != null) {
        handleChangeFlowsSheet(name, flowsSheets.length > 1);
      }
    }

    configProps.spreadSheetKey = spreadSheetKey;
    return configProps;
  }, [url]);

  useEffect(() => {
    if (configFetch.error) {
      AppToaster.show({
        intent: Intent.WARNING,
        icon: IconNames.WARNING_SIGN,
        timeout: 0,
        message: (
          <ToastContent>
            <p>
              Couldn't load the properties sheet from{` `}
              <a href={`https://docs.google.com/spreadsheets/d/${spreadSheetKey}`}>
                this spreadsheet
              </a>
              .
            </p>
            <p>Cause: {configFetch.error.message}</p>
            <p>
              If you are the owner of this spreadsheet, make sure you have shared it by doing the
              following:
              <ol>
                <li>Click the “Share” button in the spreadsheet</li>
                <li>
                  Change the selection from “Restricted” to “Anyone with the link” in the drop-down
                  under “Get link”
                </li>
              </ol>
            </p>
            <p>Make sure that there is a sheet called "properties" in the spreadsheet.</p>
          </ToastContent>
        ),
      });
    }
  }, [configFetch.error]);

  return (
    <MapContainer embed={embed}>
      {configFetch.loading || flowsSheet == null ? (
        <LoadingSpinner />
      ) : (
        <>
          <FromUrlFlowMap
            // embed={embed}
            dataFormat={'gsheets'}
            locationsUrl={makeSheetQueryUrl(spreadSheetKey!, 'locations', 'SELECT A,B,C,D', 'json')}
            flowsUrl={makeSheetQueryUrl(spreadSheetKey!, flowsSheet, 'SELECT *', 'json')}
            config={configFetch.value ? configFetch.value : DEFAULT_CONFIG}
            // onSetFlowsSheet={(name: string) => handleChangeFlowsSheet(name, true)}
          />
        </>
      )}
      {configFetch.value && configFetch.value[ConfigPropName.TITLE] && (
        <Helmet>
          <title>{`${configFetch.value[ConfigPropName.TITLE]} - Flowmap.blue`}</title>
          <link href={`https://flowmap.blue/${spreadSheetKey}`} rel="canonical" />
        </Helmet>
      )}
    </MapContainer>
  );
};

export default GSheetsFlowMap;
