import { Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { theme } from '../lib/format';
import { writePrefMirror, emitLocaleChanged } from '../lib/locale';
import { refetchGearLibraryQueries } from '../lib/relay';
import { useIsMobile } from '../lib/useIsMobile';
import type { ViewerUser } from '../lib/user';
import GearLibrary from '../guild/components/GearLibrary.react.tsx';

// 个人资料 (Profile) 表面 (原「设置」改名重构): 桌面是 modal dialog
// (portal 到 body, 复用 .yy-modal-* 体系), 移动宽度 (<=640px) 改为
// pushPage 全屏推页。内容 = Discord 身份 + 语言偏好 (存服务端
// users.locale_pref) + 我的装备库/我的方案 (GearLibrary, 与配装台共用
// 同一实现与同一 D1 存储)。文案全部来自 settingsPage / gradPage 的
// gen 字段。
//
// 选中态: 控件选中值 = 本地点选覆写 ?? 查询数据。点击瞬间先落本地覆写
// (控件立即反映), 保存成功后写镜像并触发语言切换重取 — 查询数据 (含
// localePref 与全部文案) 在同一 store 内原地刷新, 服务端值与覆写一致
// 后覆写自动撤除; 保存失败则撤覆写回滚到服务端真相并显示错误。
const SettingsDialogQueryNode = graphql`
  query SettingsDialogQuery {
    viewer {
      commonUnknownErrorText
    }
    settingsPage {
      settingsTitle
      settingsDiscordLabel
      settingsLanguageLabel
      settingsLanguageHint
      settingsAutoLabel
      settingsLangZhCnLabel
      settingsLangZhTwLabel
      settingsLangEnLabel
      settingsLangEsLabel
      settingsLangFrLabel
      settingsSavedText
      localePref
      effectiveLocale
    }
  }
`;

const SettingsUpdateMutationNode = graphql`
  mutation SettingsDialogUpdateMutation($locale: String) {
    updateMyLocale(locale: $locale) {
      ok
      error
      localePref
      effectiveLocale
    }
  }
`;

export default function SettingsDialog({ open, onClose, user }: { open: boolean; onClose: () => void; user?: ViewerUser | null }) {
  if (!open) return null;
  return (
    <Suspense fallback={<SettingsShellFallback onClose={onClose} />}>
      <SettingsDialogInner onClose={onClose} user={user ?? null} />
    </Suspense>
  );
}

function SettingsShellFallback({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return createPortal(
      <div className="yy-push-page">
        <div className="yy-push-header">
          <span onClick={onClose} style={{ fontSize: 22, color: theme.gold, cursor: 'pointer', padding: '0 6px' }}>‹</span>
        </div>
      </div>,
      document.body,
    );
  }
  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()} style={{ minHeight: 200 }} />
    </div>,
    document.body,
  );
}

function SettingsDialogInner({ onClose, user }: { onClose: () => void; user: ViewerUser | null }) {
  const data = useLazyLoadQuery<any>(SettingsDialogQueryNode, {});
  const viewer: any = data.viewer ?? {};
  const page: any = data.settingsPage ?? {};
  const isMobile = useIsMobile();
  const [commit, inFlight] = useMutation<any>(SettingsUpdateMutationNode);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // 对话框关闭 (卸载) 时重取装备库查询: 在 Profile 里对库/方案的改动
  // 立即刷给背后可能开着的配装台 (同一 GearLibraryQuery, 同一 store)。
  useEffect(() => () => { void refetchGearLibraryQueries(); }, []);

  const serverCurrent: string = page.localePref ?? 'AUTO';
  // 服务端数据追上本地覆写后撤除覆写 (此后选中态由查询数据驱动)
  useEffect(() => {
    if (picked !== null && picked === serverCurrent) setPicked(null);
  }, [picked, serverCurrent]);
  const current = picked ?? serverCurrent;

  const options: { value: string; label: string }[] = [
    { value: 'AUTO', label: page.settingsAutoLabel },
    { value: 'zh-CN', label: page.settingsLangZhCnLabel },
    { value: 'zh-TW', label: page.settingsLangZhTwLabel },
    { value: 'en', label: page.settingsLangEnLabel },
    { value: 'es', label: page.settingsLangEsLabel },
    { value: 'fr', label: page.settingsLangFrLabel },
  ];

  const choose = (value: string) => {
    if (inFlight || value === current) return;
    setPicked(value); // 控件立即反映点选, 不等服务端往返
    setError('');
    setSaved(false);
    commit({
      variables: { locale: value === 'AUTO' ? null : value },
      onCompleted: (resp: any) => {
        const payload = resp?.updateMyLocale;
        if (payload?.ok) {
          // 先落镜像再发切换事件: relay 层随即按新语言重取全部已执行
          // 查询 (含本对话框与整站文案), 界面原地切换, 无需刷新。
          writePrefMirror(payload.localePref ?? null);
          emitLocaleChanged();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        } else {
          setPicked(null);
          setError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => {
        setPicked(null);
        setError(viewer.commonUnknownErrorText || '');
      },
    });
  };

  const body = (
    <>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {user.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 46, height: 46, borderRadius: '50%', border: `1px solid ${theme.gold}`, objectFit: 'cover' }} />
          ) : (
            <span style={{
              width: 46, height: 46, borderRadius: '50%', border: `1px solid ${theme.gold}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: theme.goldHi, fontSize: 19, background: 'rgba(201,163,92,.12)',
            }}>{(user.name || '?').slice(0, 1)}</span>
          )}
          <div>
            <div style={{ color: theme.paper, fontSize: 16.5 }}>{user.name}</div>
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>{page.settingsDiscordLabel} · {user.discordId}</div>
          </div>
        </div>
      )}
      <div style={{ color: theme.paper, fontSize: 16, marginBottom: 6 }}>{page.settingsLanguageLabel}</div>
      <div style={{ color: theme.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{page.settingsLanguageHint}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup">
        {options.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              data-locale-option={opt.value}
              onClick={() => choose(opt.value)}
              disabled={inFlight}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                background: active ? 'rgba(201,163,92,.14)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${active ? theme.gold : 'rgba(201,163,92,.25)'}`,
                color: active ? theme.goldHi : theme.paper, fontSize: 14.5,
              }}
            >
              <span>{opt.label}</span>
              {active && <span style={{ color: theme.gold, fontSize: 13 }}>●</span>}
            </button>
          );
        })}
      </div>
      {saved && (
        <div style={{ color: '#7fb069', fontSize: 13, marginTop: 14 }}>✓ {page.settingsSavedText}</div>
      )}
      {error && (
        <div style={{ color: '#e58d7f', fontSize: 13, marginTop: 14 }}>{error}</div>
      )}
      <div style={{ borderTop: '1px solid rgba(201,163,92,.22)', marginTop: 24, paddingTop: 18 }}>
        <Suspense fallback={null}>
          <GearLibrary mode="profile" />
        </Suspense>
      </div>
    </>
  );

  if (isMobile) {
    return createPortal(
      <div className="yy-push-page">
        <div className="yy-push-header">
          <span onClick={onClose} style={{ fontSize: 24, color: theme.gold, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1 }}>‹</span>
          <span style={{
            fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            color: theme.goldHi, fontSize: 20, letterSpacing: 3,
          }}>{page.settingsTitle}</span>
        </div>
        <div style={{ padding: '20px 16px 0' }}>{body}</div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 'min(880px, 94vw)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            flex: 1, fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            fontSize: 22, color: theme.goldHi, letterSpacing: 4,
          }}>{page.settingsTitle}</div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>
        {body}
      </div>
    </div>,
    document.body,
  );
}
