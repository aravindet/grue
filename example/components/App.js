import React, { useState } from 'react';
import { keyBefore, keyAfter, query, decorate } from '@graffy/common';
import { useGraffy } from '@graffy/react';

import VisitorList from './VisitorList';
import Pagination from './Pagination';
import Spinner from './Spinner';

const PAGE_SIZE = 30;

function getQuery(range) {
  return query({
    visitorsByTime: [
      range,
      {
        id: true,
        ts: true,
        name: true,
        avatar: true,
        pageviews: [{ last: 3 }, true],
      },
    ],
  });
}

export default function App() {
  const [range, setRange] = useState({ last: PAGE_SIZE });
  const query = getQuery(range);
  const [result, loading] = useGraffy(query);

  const data = result && decorate(result);

  if (!data || !data.visitorsByTime) {
    // We are still performing the initial load
    return <Spinner />;
  }

  // Extract page info, this is used in several places
  const { start, end, hasNext, hasPrev } = data.visitorsByTime.pageInfo;

  const visitors = data.visitorsByTime;

  if (!loading && ((!hasNext && range.first) || (!hasPrev && range.last))) {
    // We have reached the beginning or end of the list while paginating in
    // the wrong direction; just flip the query to the first or last 30.
    setRange({ [range.first ? 'last' : 'first']: 30 });
    return <Spinner />;
  }

  return (
    <div className="App">
      <Pagination
        onPrev={
          hasPrev &&
          (() => setRange({ last: PAGE_SIZE, before: keyBefore(start) }))
        }
        range={range}
        count={visitors.length}
        onNext={
          hasNext &&
          (() => setRange({ first: PAGE_SIZE, after: keyAfter(end) }))
        }
      />
      <VisitorList visitors={visitors} />
      {loading && <Spinner />}
    </div>
  );
}