import { Link } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildLockedPage_guild$key } from './__generated__/GuildLockedPage_guild.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';

// 无权访问页 (@match 分支): 后端对 GuildLocked 只下发 slug, 响应不携带任何百业内容,
// 这里除了说明文案什么都渲染不出来 —— 能力即数据, 前端没有可 forge 的状态。
const GuildLockedPage_guild = graphql`
  fragment GuildLockedPage_guild on GuildLocked {
    slug
    lockedBackLinkLabel
    lockedTitle
    lockedBody1
    lockedBody2
    lockedBackButtonLabel
  }
`;

export default function GuildLockedPage({ guild, user, userBarText }: {
  guild: GuildLockedPage_guild$key;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  const data = useFragment(GuildLockedPage_guild, guild) as any;
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{data.lockedBackLinkLabel}</Link>
          <UserBar user={user} text={userBarText} />
        </div>
        <div className="yy-card" style={{ marginTop: 56, padding: '44px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <div style={{ fontSize: 19, color: '#ecd28f', letterSpacing: '.06em', marginBottom: 12 }}>{data.lockedTitle}</div>
          <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.9, margin: '0 auto', maxWidth: 400 }}>
            {data.lockedBody1}
            <br />
            {data.lockedBody2}
          </p>
          <Link
            to="/"
            className="yy-btn yy-btn-gold"
            style={{ display: 'inline-block', marginTop: 24, padding: '11px 30px', textDecoration: 'none' }}
          >
            {data.lockedBackButtonLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
