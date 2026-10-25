import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchViewer, type DiscordUser, type GuildItem, type SiteText } from './api';
import { getToken, setToken } from './storage';
import { logout as authLogout } from './auth';
import { ensurePushRegistration, unregisterCurrentPushToken } from './push';
import { emitLocaleChanged, initLocaleMirror, onLocaleChanged, readPrefMirror, writePrefMirror } from './locale';

type SessionState = {
  ready: boolean;
  user: DiscordUser | null;
  guilds: GuildItem[];
  publicGuilds: GuildItem[];
  text: SiteText;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionState>({
  ready: false, user: null, guilds: [], publicGuilds: [], text: {},
  refresh: async () => {}, signOut: async () => {},
});

export function useSession() { return useContext(Ctx); }

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<GuildItem[]>([]);
  const [publicGuilds, setPublicGuilds] = useState<GuildItem[]>([]);
  const [text, setText] = useState<SiteText>({});

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null); setGuilds([]); setPublicGuilds([]);
      // 未登录也要拉一次站点文案: 登录页的标题/卡文案与 Web 同源 (viewer 文案字段),
      // 匿名 viewer 同样下发这组字段, 登录页不自造文案。
      try { setText((await fetchViewer()).text); } catch { /* 取不到时组件用回退文案 */ }
      return;
    }
    try {
      const v = await fetchViewer();
      setText(v.text);
      if (!v.user) {
        // 服务端不认这张令牌（授权被吊销/不完整时后端会作废会话）→ 本地同步清掉
        await setToken(null);
        setUser(null); setGuilds([]); setPublicGuilds([]);
        return;
      }
      setUser(v.user); setGuilds(v.guilds); setPublicGuilds(v.publicGuilds);
      // 会话有效 -> 静默同步 App 推送令牌 (权限/平台不支持时内部跳过)
      void ensurePushRegistration();
      // 语言偏好对账: 服务端存储是真相, 本地镜像不一致时向服务端看齐
      // 并触发一次全树重取 (relay 层订阅同一事件)。
      if (v.localePref !== undefined && v.localePref !== readPrefMirror()) {
        writePrefMirror(v.localePref);
        emitLocaleChanged();
      }
    } catch {
      // 网络故障不踢人：保留现状，下次刷新再对齐
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initLocaleMirror();
      if (!cancelled) await refresh();
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  // 语言切换 (Profile 保存后发出): viewer 数据随新语言重拉对齐
  useEffect(() => onLocaleChanged(() => { void refresh(); }), [refresh]);

  const signOut = useCallback(async () => {
    // 先注销推送令牌 (mutation 靠当前会话鉴权), 再清本地会话
    await unregisterCurrentPushToken();
    await authLogout();
    setUser(null); setGuilds([]); setPublicGuilds([]);
  }, []);

  const value = useMemo(
    () => ({ ready, user, guilds, publicGuilds, text, refresh, signOut }),
    [ready, user, guilds, publicGuilds, text, refresh, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
