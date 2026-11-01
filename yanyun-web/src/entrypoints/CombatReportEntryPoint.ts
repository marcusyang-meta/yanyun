// Combat report page entrypoint (/{slug}/car/{carId}/report,
// Relay entrypoint pattern, same shape as BuildShareEntryPoint):
// the root component is lazy-loaded via JSResource and the
// combatReportPage query is preloaded by code before render.
// Access verdicts are the query's union variants — the page
// never touches the viewer query itself.
import JSResource from '../lib/JSResource';
import CombatReportPageQuery from '../__generated__/CombatReportPageQuery.graphql';

const CombatReportEntryPoint = {
  root: JSResource('CombatReportPage.react'),
  getPreloadProps: (props: { slug: string | null; groupingId: string; encounterId: string | null; backPath: string }) => ({
    queries: {
      combatReportQuery: {
        parameters: CombatReportPageQuery,
        variables: { slug: props.slug, groupingId: props.groupingId, encounterId: props.encounterId },
        options: { fetchPolicy: 'store-or-network' as const },
      },
    },
    extraProps: {
      slug: props.slug,
      groupingId: props.groupingId,
      encounterId: props.encounterId,
      backPath: props.backPath,
    },
  }),
};

export default CombatReportEntryPoint;
