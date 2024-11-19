import React from 'react';
import {
  FetchStateType,
  fetchLoading,
  fetchIdle,
  fetchSuccess,
  FetchState,
  stateHasData
} from "@openstax/ts-utils/fetch";
import {search, AnyOrnLocateResponse} from '@openstax/orn-locator';
import * as UI from '@openstax/ui-components';

const Uncontrolled = UI.Forms.Uncontrolled;
const Forms = UI.Forms.Controlled;

type OrnSearchProps = {
  help?: string;
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
  onSelect: (record: AnyOrnLocateResponse) => void;
};
export const OrnSearch = (props: OrnSearchProps) => {
  const [query, setQuery] = React.useState<string | undefined>();
  const [results, setResults] = React.useState<FetchState<Awaited<ReturnType<typeof search>>, string>>(fetchIdle());

  const handleSearch = React.useCallback(() => {
    if (query) {
      setResults(previous => fetchLoading(previous));

      // the search hangs the browser, so try to wait for the loader to
      // show up before triggering it
      setTimeout(() =>
        search(query).then(response =>
          setResults(fetchSuccess(response))
        )
      , 100);
    }
  }, [query]);

  return <Forms.FormSection {...props.wrapperProps}>
    <Uncontrolled.TextInput
      name="related"
      label="Subject Content"
      onChangeValue={setQuery} help={props.help}
      onKeyDown={e => {
        if (e.keyCode === 13) {
          e.preventDefault();
          handleSearch();
        }
      }}
      addon={<button type="button" onClick={handleSearch}>search</button>}
    />

    {results.type === FetchStateType.LOADING
      ? <UI.Loader />
      : null
    }

    {stateHasData(results) ? Object.entries(results.data).map(([type, {name, items}]) => <details key={name}>
      <summary>{name}</summary>
      <ul>
        {items.map((item: AnyOrnLocateResponse) => {
          const title = 'contextTitle' in item
            ? item.contextTitle : 'title' in item ? item.title
            : item.orn;

          return <li key={item.orn}>
            <button onClick={() => props.onSelect(item)} type="button">add</button>
            {'urls' in item ? <a href={item.urls.main}>{title}</a> : title}
          </li>;
        })}
      </ul>
    </details>) : null}

  </Forms.FormSection>;
};
