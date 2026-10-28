import { Link } from 'react-router-dom';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import UserBar, { type UserBarText } from './UserBar.react';
import type { SiteText } from './LoginPage.react';

export interface PickerText {
  myGuildsLabel: string;
  myGuildsEnLabel: string;
  publicGuildsLabel: string;
  publicGuildsEnLabel: string;
  readOnlyBadge: string;
  emptyTitle: string;
  emptyBody: string;
  createGuildLabel: string;
  createGuildMoreLabel: string;
}

export interface PickerGuild {
  slug: string;
  name?: string | null;
  slogan?: string | null;
  gameVersion: string;
  memberCount: number;
  avatarUrl?: string | null;
}

// Post-login landing page: "guilds I can use" + "public guilds". Both lists
// arrive pre-filtered by the backend by type (Guild = member / GuildReadOnly
// = public read-only); the frontend only renders and never fetches the full
// set to filter itself.
export default function GuildPicker({
  user, guilds, publicGuilds, site, text, userBarText,
}: {
  user: ViewerUser;
  guilds: ReadonlyArray<PickerGuild>;
  publicGuilds: ReadonlyArray<PickerGuild>;
  site: SiteText;
  text: PickerText;
  userBarText: UserBarText;
}) {
  const card = (t: PickerGuild, i: number, readOnly: boolean) => (
    <Link
      key={t.slug}
      to={`/${t.slug}`}
      className="yy-card yy-card-hover"
      style={{
        // @ts-ignore stagger delay
        '--i': i,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '18px 20px', textDecoration: 'none', color: theme.paper,
        marginBottom: 12,
      }}
    >
      {t.avatarUrl ? (
        <img
          src={t.avatarUrl}
          alt=""
          style={{
            width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
            border: '1px solid rgba(67,160,134,.45)', background: 'rgba(67,160,134,.08)',
          }}
        />
      ) : (
        <span className="yy-seal" style={{ width: 48, height: 48, fontSize: 24 }}>{site.sealText}</span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 18, color: theme.accentHi, fontWeight: 600 }}>
          {t.name}
          {readOnly && (
            <span style={{
              marginLeft: 10, fontSize: 11, color: theme.muted, border: '1px solid rgba(67,160,134,.35)',
              borderRadius: 20, padding: '2px 9px', verticalAlign: 'middle', fontWeight: 400,
            }}>{text.readOnlyBadge}</span>
          )}
        </div>
        {t.slogan && (
          <div style={{ fontSize: 13, color: theme.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.slogan}
          </div>
        )}
      </span>
      <span style={{ color: theme.accent, fontSize: 22 }}>›</span>
    </Link>
  );

  return (
    <div className="yy-page">
      <header className="yy-hero" style={{ paddingTop: 8 }}>
        {/* The user bar floats inside the hero at the top-right (the image starts at the very top of the page — no separate black bar) */}
        <div style={{
          position: 'absolute', top: 14, right: 20, zIndex: 3,
          background: 'rgba(21,23,27,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(67,160,134,.25)', borderRadius: 999, padding: '5px 10px 5px 12px',
        }}>
          <UserBar user={user} text={userBarText} />
        </div>
        <h1 className="yy-hero-title">{site.title}</h1>
        <p className="yy-hero-sub">{site.subtitle}</p>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 40px' }}>
        <div className="yy-section-head">
          <h2>{text.myGuildsLabel}</h2>
          <span className="en">{text.myGuildsEnLabel}</span>
        </div>

        {guilds.length === 0 ? (
          <div className="yy-card yy-anim-fade-up" style={{ padding: '36px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, color: theme.accentHi, letterSpacing: '.06em', marginBottom: 10 }}>
              {text.emptyTitle}
            </div>
            <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.9, margin: '0 auto 24px', maxWidth: 440 }}>
              {text.emptyBody}
            </p>
            <Link
              to="/create"
              className="yy-btn yy-btn-primary"
              style={{ display: 'inline-block', padding: '12px 32px', fontSize: 15, textDecoration: 'none' }}
            >
              {text.createGuildLabel}
            </Link>
          </div>
        ) : (
          <>
            <div className="yy-stagger">{guilds.map((t, i) => card(t, i, false))}</div>
            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Link to="/create" style={{ color: theme.muted, fontSize: 13.5, textDecoration: 'none' }}>
                {text.createGuildMoreLabel}
              </Link>
            </div>
          </>
        )}

        {publicGuilds.length > 0 && (
          <>
            <div className="yy-section-head" style={{ marginTop: 34 }}>
              <h2>{text.publicGuildsLabel}</h2>
              <span className="en">{text.publicGuildsEnLabel}</span>
            </div>
            <div className="yy-stagger">{publicGuilds.map((t, i) => card(t, i, true))}</div>
          </>
        )}
      </div>
    </div>
  );
}
