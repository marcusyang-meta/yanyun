// App shell entrypoint (Relay server-3D pattern): the root component is a
// JSResource module, its viewer query is preloaded by loadEntryPoint and
// consumed by AppRoot via usePreloadedQuery inside EntryPointContainer.
import JSResource from '../lib/JSResource';
import AppViewerQuery from '../__generated__/AppViewerQuery.graphql';

const AppEntryPoint = {
  root: JSResource('AppRoot.react'),
  getPreloadProps: () => ({
    queries: {
      viewerQuery: {
        parameters: AppViewerQuery,
        variables: {},
        options: { fetchPolicy: 'store-or-network' },
      },
    },
  }),
};

export default AppEntryPoint;
