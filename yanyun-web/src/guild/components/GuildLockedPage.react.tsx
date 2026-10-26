import { Link } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildLockedPage_guild$key } from './__generated__/GuildLockedPage_guild.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';

// No-access page (@match branch): for GuildLocked the backend sends only the
// slug — the response carries no guild content at all, so there is nothing
// here to render beyond the explanatory copy. Capability is data; the
// frontend has no state it could forge.
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
