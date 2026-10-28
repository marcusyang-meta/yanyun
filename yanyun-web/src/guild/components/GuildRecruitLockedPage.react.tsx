import { Link } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildRecruitLockedPage_guildRecruit$key } from './__generated__/GuildRecruitLockedPage_guildRecruit.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';
import { hostGuildSlug } from '../../lib/hostGuild';

// Recruit no-access page (@match branch): for GuildRecruitLocked the
// backend sends only the slug and this page's copy — no guild data.
const GuildRecruitLockedPage_guildRecruit = graphql`
  fragment GuildRecruitLockedPage_guildRecruit on GuildRecruitLocked {
    slug
    lockedTitle
    lockedBody
    backLabel
  }
`;

export default function GuildRecruitLockedPage({ guildRecruit, user, userBarText }: {
  guildRecruit: GuildRecruitLockedPage_guildRecruit$key;
  slug: string;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  const data = useFragment(GuildRecruitLockedPage_guildRecruit, guildRecruit) as any;
  const onOwnSubdomain = hostGuildSlug() === data.slug;
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          {onOwnSubdomain ? (
            <a href="https://yanyun.app/" style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{data.backLabel}</a>
          ) : (
            <Link to="/" style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{data.backLabel}</Link>
          )}
          <UserBar user={user} text={userBarText} />
        </div>
        <div className="yy-card" style={{ marginTop: 56, padding: '44px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <div style={{ fontSize: 19, color: '#ecd28f', letterSpacing: '.06em', marginBottom: 12 }}>{data.lockedTitle}</div>
          <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.9, margin: '0 auto', maxWidth: 420 }}>
            {data.lockedBody}
          </p>
        </div>
      </div>
    </div>
  );
}
