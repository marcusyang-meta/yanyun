import { Link, useNavigate } from 'react-router-dom';
import { useState, Suspense } from 'react';
import type { ViewerUser } from '../../lib/user';
import { GroupingListRoute } from './GroupingList.react.tsx';
import { GroupingDetailRoute } from './GroupingDetail.react.tsx';
import { BossDexRoute } from './BossDex.react.tsx';
import { SectDetailRoute } from './SectDetail.react.tsx';
import { ToastHost } from './Toast.react.tsx';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';


function TabFallback() {
  return (
    <div style={{ padding: '24px 0' }}>
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

export interface GuildHomeNode {
  name?: string | null;
  gameVersion: string;
  // 百业自定义头像 (后端 avatarUrl 字段; 无头像为 null, 页眉回退现状)
  avatarUrl?: string | null;
  // 当前用户在该百业绑定服务器的昵称 (后端下发; 无/未绑定为 null)
  viewerNick?: string | null;
  // 主页外壳文案 (后端 Guild/GuildReadOnly 文案字段下发)
  homeBackToHubLabel: string;
  homeTabTeamLabel: string;
  homeTabDexLabel: string;
  homeTabSectLabel: string;
  detailNotFoundText: string;
  detailBackToListLabel: string;
}

// 百业主页外壳 (成员版 / 公开只读版共用): 头部 + 标签页 + 车队详情直链展开。
// interactive=false 时不挂载任何写入口 (发车/报名/编辑组件树根本不渲染)。
export default function GuildHome({ node, slug, carId, user, userBarText, interactive, banner }: {
  node: GuildHomeNode;
  slug: string;
  carId?: string;
  user: ViewerUser;
  userBarText: UserBarText;
  interactive: boolean;
  banner?: string;
}) {
  const TABS = [
    { key: 'team', label: node.homeTabTeamLabel },
    { key: 'dex', label: node.homeTabDexLabel },
    { key: 'sect', label: node.homeTabSectLabel },
  ] as const;
  const [activeTab, setActiveTab] = useState<string>('team');
  const navigate = useNavigate();
  // 顶栏在百业语境显示服务器昵称 (有才换, 全局语境仍是全局名);
  // 表单/落座预填: 服务器昵称优先, 回退全局名。
  const barUser = node.viewerNick ? { ...user, name: node.viewerNick } : user;
  const defaultNickname = node.viewerNick || user.name || '';

  return (
    <div className="yy-page">
      <ToastHost />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>
        <header className="yy-anim-fade-up" style={{ padding: '36px 0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ color: theme.muted, fontSize: 13, textDecoration: 'none', letterSpacing: '.1em' }}>
              {node.homeBackToHubLabel}
            </Link>
            <UserBar user={barUser} text={userBarText} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {node.avatarUrl && (
              <img
                src={node.avatarUrl}
                alt=""
                style={{
                  width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                  border: '2px solid rgba(201,163,92,.55)', background: 'rgba(201,163,92,.08)',
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-brush)', fontSize: 42, color: '#ecd28f', margin: '12px 0 4px', letterSpacing: '.08em' }}>
                {node.name}
              </h1>
              <p style={{ color: theme.muted, fontSize: 13, letterSpacing: '.06em', margin: 0 }}>{node.gameVersion}</p>
            </div>
          </div>
          {banner && (
            <div style={{
              marginTop: 12, padding: '9px 14px', borderRadius: 8, fontSize: 13,
              color: '#ecd28f', background: 'rgba(201,163,92,.08)', border: '1px solid rgba(201,163,92,.25)',
            }}>{banner}</div>
          )}
        </header>

        {/* 可分享的车详情直链 /:slug/car/:id：直接展开该车详情 */}
        {carId ? (
          <div className="yy-tabpanel" style={{ paddingBottom: 40 }}>
            <Suspense fallback={<TabFallback />}>
              <GroupingDetailRoute
                slug={slug}
                groupingId={carId}
                onBack={() => navigate(`/${slug}`)}
                interactive={interactive}
                defaultNickname={defaultNickname}
                goneText={node.detailNotFoundText}
                backText={node.detailBackToListLabel}
              />
            </Suspense>
          </div>
        ) : (
          <>
            <nav className="yy-tabs" style={{ marginTop: 20 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`yy-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div key={activeTab} className="yy-tabpanel" style={{ paddingBottom: 40 }}>
              <Suspense fallback={<TabFallback />}>
                {activeTab === 'team' && <GroupingListRoute slug={slug} interactive={interactive} defaultNickname={defaultNickname} />}
                {activeTab === 'dex' && <BossDexRoute />}
                {activeTab === 'sect' && <SectDetailRoute />}
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
