// Public build share page entrypoint (/b/:code, Relay server-3D
// pattern, same shape as LegalEntryPoint): the root component is
// lazy-loaded via JSResource and the sharedBuild query is preloaded
// by code before render. The page is anonymous — the share code is
// the capability — so it never touches the viewer query.
import JSResource from '../lib/JSResource';
import BuildSharePageQuery from '../__generated__/BuildSharePageQuery.graphql';

const BuildShareEntryPoint = {
  root: JSResource('BuildSharePage.react'),
  getPreloadProps: (props: { code: string }) => ({
    queries: {
      buildShareQuery: {
        parameters: BuildSharePageQuery,
        variables: { code: props.code },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
  }),
};

export default BuildShareEntryPoint;
