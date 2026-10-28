import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { UserBarText } from '../../auth/UserBar.react';
import type { PublicGuildHome_guild$key } from './__generated__/PublicGuildHome_guild.graphql';
import GuildHome from './GuildHome.react.tsx';

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
      node={data}
      slug={slug}
      carId={carId}
      user={user}
      userBarText={userBarText}
      interactive={false}
      banner={(data as any).homeReadOnlyBanner}
    />
  );
}
