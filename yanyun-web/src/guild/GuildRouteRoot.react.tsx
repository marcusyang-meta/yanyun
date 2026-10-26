import { graphql, useFragment, usePreloadedQuery } from 'react-relay';
import MatchContainer from '../lib/MatchContainer';
import type { PreloadedQuery } from 'react-relay';
import { matchLoader } from '../lib/JSResource';
import type { ViewerUser } from '../lib/user';
import type { GuildRouteQuery as GuildRouteQueryType } from './__generated__/GuildRouteQuery.graphql';
import type { GuildRouteRoot_viewer$key } from './__generated__/GuildRouteRoot_viewer.graphql';
import { theme } from '../lib/format';

// Data root = viewer.guild(slug): the response type is the permission
// conclusion (server 3D). GuildRouteRoot_viewer is a @match fragment: each of
// the three branches binds a JSResource component module via @module, and
// MatchContainer picks the module by the server response's structure — the
// client has no __typename switch and no permission flags.
const GuildRouteQueryNode = graphql`
  query GuildRouteQuery($slug: String!) {
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
      ...GuildRouteRoot_viewer @arguments(slug: $slug)
    }
  }
`;

const GuildRouteRoot_viewer = graphql`
  fragment GuildRouteRoot_viewer on Viewer
  @argumentDefinitions(slug: { type: "String!" }) {
    guild(slug: $slug) {
      ...MemberGuildHome_guild @module(name: "MemberGuildHome.react")
      ...PublicGuildHome_guild @module(name: "PublicGuildHome.react")
      ...GuildLockedPage_guild @module(name: "GuildLockedPage.react")
    }
  }
`;

export default function GuildRouteRoot({ queries, extraProps }: {
  queries: { guildQuery: PreloadedQuery<GuildRouteQueryType> };
  extraProps: { slug: string; carId: string | null };
}) {
  const data = usePreloadedQuery<GuildRouteQueryType>(GuildRouteQueryNode, queries.guildQuery);
  const viewer = useFragment(GuildRouteRoot_viewer, data.viewer as GuildRouteRoot_viewer$key);
  const user: ViewerUser = data.viewer.user ?? { discordId: '', name: '' };
  const viewerAny = data.viewer as any;
  const userBarText = {
    logoutLabel: viewerAny.userBarLogoutLabel,
    loggingOutLabel: viewerAny.userBarLoggingOutLabel,
    settingsLabel: viewerAny.userBarSettingsLabel,
  };
  return (
    <MatchContainer
      match={viewer.guild}
      loader={matchLoader}
      props={{
        slug: extraProps.slug,
        carId: extraProps.carId ?? undefined,
        user,
        userBarText,
      }}
      fallback={
        <div style={{ padding: 60, textAlign: 'center', color: theme.muted, fontSize: 14 }}>
          {viewerAny.commonLoadingGuildText}
        </div>
      }
    />
  );
}
