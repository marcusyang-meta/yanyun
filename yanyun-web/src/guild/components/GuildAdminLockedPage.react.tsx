import { Link } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildAdminLockedPage_guildAdmin$key } from './__generated__/GuildAdminLockedPage_guildAdmin.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';

// Admin no-access page (@match branch): for GuildAdminLocked the
// backend sends only the slug and this page's copy — no guild data.
const GuildAdminLockedPage_guildAdmin = graphql`
  fragment GuildAdminLockedPage_guildAdmin on GuildAdminLocked {
    slug
    adminLockedTitle
    adminLockedBody
    adminBackLinkLabel
  }
`;

export default function GuildAdminLockedPage({ guildAdmin, slug, user, userBarText }: {
  guildAdmin: GuildAdminLockedPage_guildAdmin$key;
  slug: string;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  const data = useFragment(GuildAdminLockedPage_guildAdmin, guildAdmin) as any;
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to={`/${slug}`} style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{data.adminBackLinkLabel}</Link>
          <UserBar user={user} text={userBarText} />
        </div>
        <div className="yy-card" style={{ marginTop: 56, padding: '44px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <div style={{ fontSize: 19, color: '#ecd28f', letterSpacing: '.06em', marginBottom: 12 }}>{data.adminLockedTitle}</div>
          <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.9, margin: '0 auto', maxWidth: 420 }}>
            {data.adminLockedBody}
          </p>
        </div>
      </div>
    </div>
  );
}
