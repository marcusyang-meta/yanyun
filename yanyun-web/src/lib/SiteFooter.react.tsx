import { Link } from 'react-router-dom';
import { theme } from './format';

export interface FooterText {
  disclaimer: string;
  termsLabel: string;
  privacyLabel: string;
}

// Site-wide footer, rendered once by AppRoot below the routes so it covers
// the login, picker, guild and legal pages. All copy comes from backend
// viewer text fields via props.
export default function SiteFooter({ text }: { text: FooterText }) {
  if (!text || !text.disclaimer) return null;
  return (
    <footer className="yy-site-footer">
      <p style={{ color: theme.muted, fontSize: 12, lineHeight: 1.8, margin: '0 0 12px' }}>
        {text.disclaimer}
      </p>
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13 }}>
        <Link to="/terms" style={{ color: theme.gold, textDecoration: 'none' }}>{text.termsLabel}</Link>
        <Link to="/privacy" style={{ color: theme.gold, textDecoration: 'none' }}>{text.privacyLabel}</Link>
      </div>
    </footer>
  );
}
