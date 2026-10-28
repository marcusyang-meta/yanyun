import { graphql, useFragment, usePreloadedQuery } from 'react-relay';
import MatchContainer from '../lib/MatchContainer';
import type { PreloadedQuery } from 'react-relay';
import { matchLoader } from '../lib/JSResource';
import type { ViewerUser } from '../lib/user';
import type { GuildRecruitRouteQuery as GuildRecruitRouteQueryType } from './__generated__/GuildRecruitRouteQuery.graphql';
import type { GuildRecruitRouteRoot_viewer$key } from './__generated__/GuildRecruitRouteRoot_viewer.graphql';
import { theme } from '../lib/format';

// Data root = viewer.guildRecruit(slug): the response type is the
// permission conclusion (server 3D). The @match fragment binds the
// recruit page or the locked page by response structure — the client
// has no __typename switch and no permission flags.
const GuildRecruitRouteQueryNode = graphql`
  query GuildRecruitRouteQuery($slug: String!) {
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
      ...GuildRecruitRouteRoot_viewer @arguments(slug: $slug)
    }
  }
`;

const GuildRecruitRouteRoot_viewer = graphql`
  fragment GuildRecruitRouteRoot_viewer on Viewer
  @argumentDefinitions(slug: { type: "String!" }) {
    guildRecruit(slug: $slug) {
      ...GuildRecruitPage_guildRecruit @module(name: "GuildRecruitPage.react")
      ...GuildRecruitLockedPage_guildRecruit @module(name: "GuildRecruitLockedPage.react")
    }
  }
`;

export default function GuildRecruitRouteRoot({ queries, extraProps }: {
  queries: { recruitQuery: PreloadedQuery<GuildRecruitRouteQueryType> };
  extraProps: { slug: string };
}) {
  const data = usePreloadedQuery<GuildRecruitRouteQueryType>(GuildRecruitRouteQueryNode, queries.recruitQuery);
  const viewer = useFragment(GuildRecruitRouteRoot_viewer, data.viewer as GuildRecruitRouteRoot_viewer$key);
  const user: ViewerUser = data.viewer.user ?? { discordId: '', name: '' };
  const viewerAny = data.viewer as any;
  const userBarText = {
    logoutLabel: viewerAny.userBarLogoutLabel,
    loggingOutLabel: viewerAny.userBarLoggingOutLabel,
    settingsLabel: viewerAny.userBarSettingsLabel,
  };
  return (
    <MatchContainer
      match={viewer.guildRecruit}
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
