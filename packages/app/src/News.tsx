import { Link } from 'react-router-dom';
import { Away } from '@flowmap.blue/core';
import * as React from 'react';
import styled from '@emotion/styled';
import { Colors } from '@blueprintjs/core';

const Outer = styled.div`
  display: flex;
  flex-direction: column;
  & > * + * {
    margin-top: 0.75rem;
  }
`;

const NewsDate = styled.div`
  color: ${Colors.GRAY3};
  font-size: small;
  min-width: 100px;
`;

const NewsText = styled.div`
  display: block;
`;

const NewsItem = styled.div`
  display: flex;
  align-items: center;
`;

export default () => (
  <Outer>
    <NewsItem>
      <NewsDate>Jul 01, 2020</NewsDate>
      <NewsText>
        <Away href="https://github.com/FlowmapBlue/flowmapblue.R">
          Flowmap.blue R widget released
        </Away>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Apr 26, 2020</NewsDate>
      <NewsText>
        <Away href="https://tinyletter.com/flowmap-blue/letters/flowmap-blue-news-april-2020-timeline-support">
          Timeline support, splitting datasets in parts, customising tooltips, fetching data from
          another server
        </Away>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Feb 17, 2020</NewsDate>
      <NewsText>
        <Away href="https://tinyletter.com/flowmap-blue/letters/flowmap-blue-news-feb-2020-new-features">
          Lasso selection, camera rotation and tilting, new location/flow filtering modes
        </Away>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Jan 06, 2020</NewsDate>
      <NewsText>
        The flow thickness and color scales now{' '}
        <Away href="https://twitter.com/ilyabo/status/1213968896182669312">
          automatically adapt to the viewport
        </Away>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Dec 25, 2019</NewsDate>
      <NewsText>
        Added support for <a href="videos/sharing.mp4">sharing and embedding</a>.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Nov 20, 2019</NewsDate>
      <NewsText>
        Flowmap.blue{' '}
        <Away href="https://twitter.com/infobeautyaward/status/1197248080640380929">
          won Bronze at the Information is Beautiful Awards
        </Away>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Nov 11, 2019</NewsDate>
      <NewsText>
        Added the <Link to="/in-browser">In-browser flow map</Link>
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Nov 10, 2019</NewsDate>
      <NewsText>
        Added the <Link to="/geocoding">Geocoding</Link> data preparation helper tool
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Nov 08, 2019</NewsDate>
      <NewsText>
        Added the <Link to="/od-matrix-converter">OD-matrix converter</Link> data preparation helper
        tool
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Nov 05, 2019</NewsDate>
      <NewsText>
        Talk{' '}
        <Away href="https://ilya.boyandin.me/talks/2019-11-05-on-data-and-design/">
          “Visualizing mobility”
        </Away>{' '}
        at the{' '}
        <Away href="https://www.meetup.com/ondataanddesign-Switzerland/events/265947767/">
          “On data and design” meetup
        </Away>{' '}
        in Basel
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 28, 2019</NewsDate>
      <NewsText>
        Added the fade slider to manually adjust the brightness of the arrows for better map
        visibility
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 26, 2019</NewsDate>
      <NewsText>
        The dark mode is now enabled by default. Changed the home page appearance.
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 16, 2019</NewsDate>
      <NewsText>
        Flowmap.blue{' '}
        <Away href="http://informationisbeautifulawards.com/showcase/3815-flowmap-blue">
          made it to the shortlist
        </Away>{' '}
        of the Information is Beautiful Awards
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Oct 13, 2019</NewsDate>
      <NewsText>
        Talk{' '}
        <Away href="https://ilya.boyandin.me/talks/2019-10-11-urban-mobility-symp/">
          “Scalability of OD-data visualizations”
        </Away>{' '}
        about Flowmap.blue and{' '}
        <Away href="https://github.com/teralytics/flowmap.query">flowmap.query</Away> at the{' '}
        <Away href="https://www.citylab-berlin.org/events/mobilitysymposium_en/">
          Urban Mobility Symposium
        </Away>{' '}
        in Berlin
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Sep 15, 2019</NewsDate>
      <NewsText>Added color scheme and dark mode support</NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 26, 2019</NewsDate>
      <NewsText>Adding support for map styles</NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 24, 2019</NewsDate>
      <NewsText>Automatic clustering</NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Mar 03, 2019</NewsDate>
      <NewsText>
        <Away href="https://ilya.boyandin.me/talks/2019-03-03-clisel/">
          Talk about Flowmap.blue
        </Away>{' '}
        at the workshop on{' '}
        <Away href="https://clisel.eu/Ascona">Environmental Changes and Human Mobility</Away> in
        Ascona
      </NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Feb 08, 2019</NewsDate>
      <NewsText>Added animation toggle</NewsText>
    </NewsItem>
    <NewsItem>
      <NewsDate>Jan 03, 2019</NewsDate>
      <NewsText>First published online</NewsText>
    </NewsItem>
  </Outer>
);
