import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { UserBarText } from '../../auth/UserBar.react';
import type { MemberGuildHome_guild$key } from './__generated__/MemberGuildHome_guild.graphql';
import GuildHome from './GuildHome.react.tsx';

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
    homeAdminLabel
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
  return <GuildHome node={data} slug={slug} carId={carId} user={user} userBarText={userBarText} interactive />;
}
