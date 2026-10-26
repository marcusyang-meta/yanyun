// Legal page entrypoint (Relay server-3D pattern, same shape as
// AppEntryPoint): the root component is lazy-loaded via JSResource and the
// legalPage query is preloaded by kind before render. kind is decided by the
// route (/terms -> TERMS, /privacy -> PRIVACY) and passed in via props.
import JSResource from '../lib/JSResource';
import LegalPageQuery from '../__generated__/LegalPageQuery.graphql';

const LegalEntryPoint = {
  root: JSResource('LegalPage.react'),
  getPreloadProps: (props: { kind: string }) => ({
    queries: {
      legalQuery: {
        parameters: LegalPageQuery,
        variables: { kind: props.kind },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
  }),
};

export default LegalEntryPoint;
