import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { UserBarText } from '../../auth/UserBar.react';
import type { MemberGuildHome_guild$key } from './__generated__/MemberGuildHome_guild.graphql';
import GuildHome from './GuildHome.react.tsx';
import { insightsNodeOf } from './GuildInsightsBoard.react.tsx';

// Member home (@match branch, bound-server members): full functionality —
// write entries are mounted only in this branch's component tree.
const MemberGuildHome_guild = graphql`
  fragment MemberGuildHome_guild on Guild {
    slug
    name
    slogan
    gameVersion
    avatarUrl
    viewerNick
    pageBackLabel
    pageFooterDisclaimerText
    homeTabTeamLabel
    homeTabDexLabel
    homeTabSectLabel
    homeTabAnnouncementsLabel
    homeTabScheduleLabel
    homeTabMarketLabel
    homeTabAlliesLabel
    homeAdminLabel
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

export default function MemberGuildHome({ guild, slug, carId, user, userBarText }: {
  guild: MemberGuildHome_guild$key;
  slug: string;
  carId?: string;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  const data = useFragment(MemberGuildHome_guild, guild);
  return <GuildHome node={{ ...data, insights: insightsNodeOf(data) }} slug={slug} carId={carId} user={user} userBarText={userBarText} />;
}
