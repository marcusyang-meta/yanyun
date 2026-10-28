import { Link } from 'react-router-dom';
import { graphql, useFragment } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildLockedPage_guild$key } from './__generated__/GuildLockedPage_guild.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';
import { hostGuildSlug } from '../../lib/hostGuild';

// No-access page (@match branch): for GuildLocked the backend sends only the
// slug — the response carries no guild content at all, so there is nothing
// here to render beyond the explanatory copy. Capability is data; the
// frontend has no state it could forge.
const GuildLockedPage_guild = graphql`
  fragment GuildLockedPage_guild on GuildLocked {
    slug
    recruitEntryLabel
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
  // On this guild's own subdomain, "/" is this same locked page; the
  // back links leave for the apex site's root (the guild picker)
  // instead of looping.
  const onOwnSubdomain = hostGuildSlug() === data.slug;
  const backLink = (label: string, style: any, className?: string) => onOwnSubdomain ? (
    <a href="https://yanyun.app/" style={style} className={className}>{label}</a>
  ) : (
    <Link to="/" style={style} className={className}>{label}</Link>
  );
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          {backLink(data.lockedBackLinkLabel, { color: theme.muted, textDecoration: 'none', fontSize: 14 })}
          <UserBar user={user} text={userBarText} />
        </div>
        <div className="yy-card" style={{ marginTop: 56, padding: '44px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔒</div>
          <div style={{ fontSize: 19, color: '#93d2be', letterSpacing: '.06em', marginBottom: 12 }}>{data.lockedTitle}</div>
          <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.9, margin: '0 auto', maxWidth: 400 }}>
            {data.lockedBody1}
            <br />
            {data.lockedBody2}
          </p>
          {backLink(data.lockedBackButtonLabel, { display: 'inline-block', marginTop: 24, padding: '11px 30px', textDecoration: 'none' }, 'yy-btn yy-btn-primary')}
          {/* The non-member's way in: the recruit page carries the
              join application for exactly this viewer (F16). */}
          <div>
            <Link
              to={onOwnSubdomain ? '/recruit' : `/${data.slug}/recruit`}
              className="yy-btn"
              style={{ display: 'inline-block', marginTop: 12, padding: '11px 30px', textDecoration: 'none' }}
            >
              {data.recruitEntryLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
