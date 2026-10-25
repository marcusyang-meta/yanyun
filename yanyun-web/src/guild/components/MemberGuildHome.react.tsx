import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { UserBarText } from '../../auth/UserBar.react';
import type { MemberGuildHome_guild$key } from './__generated__/MemberGuildHome_guild.graphql';
import GuildHome from './GuildHome.react.tsx';

// 成员主页 (@match 分支, 绑定服务器成员): 完整功能, 写入口只挂在这个分支的组件树里。
const MemberGuildHome_guild = graphql`
  fragment MemberGuildHome_guild on Guild {
    slug
    name
    slogan
    gameVersion
    viewerNick
    homeBackToHubLabel
    homeTabTeamLabel
    homeTabDexLabel
    homeTabSectLabel
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
