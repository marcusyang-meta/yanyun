import { theme } from '../lib/format';

export interface SiteText {
  title: string;
  subtitle: string;
  heroAlt: string;
  sealText: string;
}

export interface LoginText {
  cardTitle: string;
  cardBody1: string;
  cardBody2: string;
  buttonLabel: string;
  privacyText: string;
}

// Login page: the only page a logged-out visitor can see (Discord auth
// first). After a successful login the Discord callback returns with
// returnTo, deep-linking back. All copy comes from backend viewer text
// fields via props.
export default function LoginPage({ returnTo = '/', site, text }: {
  returnTo?: string;
  site: SiteText;
  text: LoginText;
}) {
  const loginHref = `/auth/discord/login?returnTo=${encodeURIComponent(returnTo || '/')}`;
  return (
    <div className="yy-page">
      <header className="yy-hero yy-hero-full">
        <h1 className="yy-hero-title">{site.title}</h1>
        <p className="yy-hero-sub">{site.subtitle}</p>

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 520, margin: '40px auto 0', textAlign: 'center' }}>
          <div className="yy-card yy-login-card yy-anim-fade-up" style={{ padding: '32px 24px' }}>
            <div style={{ fontSize: 17, color: theme.accentHi, letterSpacing: '.08em', marginBottom: 10 }}>
              {text.cardTitle}
            </div>
            <p style={{ color: theme.muted, fontSize: 14, lineHeight: 1.8, margin: '0 0 24px' }}>
              {text.cardBody1}
              <br />
              {text.cardBody2}
            </p>
            <a
              href={loginHref}
              className="yy-btn yy-btn-primary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '13px 34px', fontSize: 16, textDecoration: 'none', letterSpacing: '.06em',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.51 13.8 13.8 0 0 0-.64 1.28 18.3 18.3 0 0 0-5.5 0 13.8 13.8 0 0 0-.64-1.28c-1.71.29-3.36.8-4.93 1.51A20.3 20.3 0 0 0 .1 18.06a19.9 19.9 0 0 0 6.07 3.03c.49-.66.93-1.37 1.3-2.1a12.9 12.9 0 0 1-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.16 0c.16.13.33.26.5.38-.65.39-1.34.72-2.05.98.37.73.81 1.44 1.3 2.1a19.9 19.9 0 0 0 6.07-3.03 20.3 20.3 0 0 0-2.58-13.69ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
              </svg>
              {text.buttonLabel}
            </a>
            <p style={{ color: theme.muted, fontSize: 12, marginTop: 18 }}>
              {text.privacyText}
            </p>
          </div>
        </div>
      </header>
    </div>
  );
}
