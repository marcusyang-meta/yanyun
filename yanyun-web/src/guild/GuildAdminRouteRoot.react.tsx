import { graphql, useFragment, usePreloadedQuery } from 'react-relay';
import MatchContainer from '../lib/MatchContainer';
import type { PreloadedQuery } from 'react-relay';
import { matchLoader } from '../lib/JSResource';
import type { ViewerUser } from '../lib/user';
import type { GuildAdminRouteQuery as GuildAdminRouteQueryType } from './__generated__/GuildAdminRouteQuery.graphql';
import type { GuildAdminRouteRoot_viewer$key } from './__generated__/GuildAdminRouteRoot_viewer.graphql';
import { theme } from '../lib/format';

// Data root = viewer.guildAdmin(slug): the response type is the
// permission conclusion (server 3D). The @match fragment binds the
// admin page or the locked page by response structure — the client
// has no __typename switch and no permission flags.
const GuildAdminRouteQueryNode = graphql`
  query GuildAdminRouteQuery($slug: String!) {
    viewer {
      user {
        discordId
        name
        avatar
      }
      userBarLogoutLabel
      userBarLoggingOutLabel
      userBarSettingsLabel
      commonLoadingGuildText
      commonConfirmLabel
      commonCancelLabel
      commonUnknownErrorText
      ...GuildAdminRouteRoot_viewer @arguments(slug: $slug)
    }
  }
`;

const GuildAdminRouteRoot_viewer = graphql`
  fragment GuildAdminRouteRoot_viewer on Viewer
  @argumentDefinitions(slug: { type: "String!" }) {
    guildAdmin(slug: $slug) {
      ...GuildAdminPage_guildAdmin @module(name: "GuildAdminPage.react")
      ...GuildAdminLockedPage_guildAdmin @module(name: "GuildAdminLockedPage.react")
    }
  }
`;

export default function GuildAdminRouteRoot({ queries, extraProps }: {
  queries: { adminQuery: PreloadedQuery<GuildAdminRouteQueryType> };
  extraProps: { slug: string };
}) {
  const data = usePreloadedQuery<GuildAdminRouteQueryType>(GuildAdminRouteQueryNode, queries.adminQuery);
  const viewer = useFragment(GuildAdminRouteRoot_viewer, data.viewer as GuildAdminRouteRoot_viewer$key);
  const user: ViewerUser = data.viewer.user ?? { discordId: '', name: '' };
  const viewerAny = data.viewer as any;
  const userBarText = {
    logoutLabel: viewerAny.userBarLogoutLabel,
    loggingOutLabel: viewerAny.userBarLoggingOutLabel,
    settingsLabel: viewerAny.userBarSettingsLabel,
  };
  return (
    <MatchContainer
      match={viewer.guildAdmin}
      loader={matchLoader}
      props={{
        slug: extraProps.slug,
        user,
        userBarText,
        commonText: {
          confirm: viewerAny.commonConfirmLabel,
          cancel: viewerAny.commonCancelLabel,
          unknownError: viewerAny.commonUnknownErrorText,
        },
      }}
      fallback={
        <div style={{ padding: 60, textAlign: 'center', color: theme.muted, fontSize: 14 }}>
          {viewerAny.commonLoadingGuildText}
        </div>
      }
    />
  );
}
