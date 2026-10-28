// Public car share page entrypoint (/s/:code, Relay server-3D
// pattern, same shape as BuildShareEntryPoint): the root component
// is lazy-loaded via JSResource and the sharedGrouping query is
// preloaded by code before render. The page is anonymous — the
// share code is the capability — so its own query never requires
// a viewer; the viewer field rides along only so the page can pick
// its call-to-action label (login vs open the full page).
import JSResource from '../lib/JSResource';
import CarSharePageQuery from '../__generated__/CarSharePageQuery.graphql';

const CarShareEntryPoint = {
  root: JSResource('CarSharePage.react'),
  getPreloadProps: (props: { code: string }) => ({
    queries: {
      carShareQuery: {
        parameters: CarSharePageQuery,
        variables: { code: props.code },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
    extraProps: { code: props.code },
  }),
};

export default CarShareEntryPoint;
