import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { UserBarText } from '../../auth/UserBar.react';
import type { PublicGuildHome_guild$key } from './__generated__/PublicGuildHome_guild.graphql';
import GuildHome from './GuildHome.react.tsx';
import { insightsNodeOf } from './GuildInsightsBoard.react.tsx';

// Public home for an unbound guild (@match branch): read-only, mounts no
// write-entry components.
const PublicGuildHome_guild = graphql`
  fragment PublicGuildHome_guild on GuildReadOnly {
    slug
    name
    slogan
    gameVersion
    avatarUrl
    pageBackLabel
    pageFooterDisclaimerText
    homeTabTeamLabel
    homeTabDexLabel
    homeTabSectLabel
    homeTabAnnouncementsLabel
    homeReadOnlyBanner
    homeInsightsRaceTitle
    homeInsightsRaceEmptyText
    homeInsightsRaceTeamLabel
    homeInsightsRaceRunsLabel
    homeInsightsRaceWinsLabel
    homeInsightsRaceBestLabel
    homeInsightsSelfGearTitle
    homeInsightsGearScoreLabel
    homeInsightsGearMinScoreLabel
    raceSeasonBoard {
      __typename
      ... on RaceSeasonBoard {
        seasons {
          season seasonLabel
          entries { teamName members runCount winCount bestTimeMs bestTimeText }
        }
      }
      ... on GuildInsightsLocked { premiumTitle }
    }
    gearSelfStatus {
      __typename
      ... on GuildGearSelfStatus {
        entries { standardId label minScore myScore met statusText }
      }
      ... on GuildInsightsLocked { premiumTitle }
    }
    detailNotFoundText
    detailBackToListLabel
  }
`;

export default function PublicGuildHome({ guild, slug, carId, user, userBarText }: {
  guild: PublicGuildHome_guild$key;
  slug: string;
  carId?: string;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  const data = useFragment(PublicGuildHome_guild, guild);
  return (
    <GuildHome
      node={{ ...data, insights: insightsNodeOf(data) }}
      slug={slug}
      carId={carId}
      user={user}
      userBarText={userBarText}
      interactive={false}
      banner={(data as any).homeReadOnlyBanner}
    />
  );
}
