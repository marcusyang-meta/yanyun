import { Link } from 'react-router-dom';
import { theme } from './format';

export interface FooterText {
  disclaimer: string;
  termsLabel: string;
  privacyLabel: string;
}

// 全站页脚: 非官方声明 + 服务条款/隐私政策入口。
// 全部文案由后端 viewer 文案字段下发 (props), 本组件不持有 UI 文案。
// 由 AppRoot 在路由下方统一渲染一次, 覆盖登录页/选择页/百业页/法律页。
export default function SiteFooter({ text }: { text: FooterText }) {
  if (!text || !text.disclaimer) return null;
  return (
    <footer style={{ maxWidth: 860, margin: '0 auto', padding: '30px 20px 38px', textAlign: 'center' }}>
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
