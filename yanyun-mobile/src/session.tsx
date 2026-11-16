import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchViewer, type DiscordUser, type GuildItem, type HomeRecruitData, type SiteText } from './api';
import { getToken, setToken } from './storage';
import { logout as authLogout } from './auth';
import { ensurePushRegistration, unregisterCurrentPushToken } from './push';
import { emitLocaleChanged, initLocaleMirror, onLocaleChanged, readPrefMirror, writePrefMirror } from './locale';
import { resolveThemeVariant, type ThemeVariant } from './theme';

type SessionState = {
  ready: boolean;
  user: DiscordUser | null;
  guilds: GuildItem[];
  homeRecruit: HomeRecruitData | null;
  text: SiteText;
  // Account chrome theme (Viewer.myThemePref, resolved server-side;
  // 'classic' until a viewer load says otherwise, and for anonymous).
  themePref: ThemeVariant;
  // Immediate local application after Profile saves a new theme; the
  // next viewer refresh reconciles with the server value regardless.
  setThemePref: (v: ThemeVariant) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<SessionState>({
  ready: false, user: null, guilds: [], homeRecruit: null, text: {},
  themePref: 'classic', setThemePref: () => {},
  refresh: async () => {}, signOut: async () => {},
});

export function useSession() { return useContext(Ctx); }

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<GuildItem[]>([]);
  const [homeRecruit, setHomeRecruit] = useState<HomeRecruitData | null>(null);
  const [text, setText] = useState<SiteText>({});
  const [themePref, setThemePrefState] = useState<ThemeVariant>('classic');
  const setThemePref = useCallback((v: ThemeVariant) => setThemePrefState(v), []);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null); setGuilds([]); setHomeRecruit(null);
      // Site copy is fetched even when signed out: the login page's title/card
      // copy shares Web's source (viewer copy fields), and the anonymous
      // viewer supplies the same fields -- the login page never invents copy.
      try {
        const v = await fetchViewer();
        setText(v.text);
        // Anonymous viewers resolve to classic on the server already.
        setThemePrefState(resolveThemeVariant(v.themePref));
      } catch { /* Fall back to built-in copy when unavailable */ }
      return;
    }
    try {
      const v = await fetchViewer();
      setText(v.text);
      if (!v.user) {
        // The server rejects this token (session voided when the grant is revoked/incomplete) -> clear it locally in sync
        await setToken(null);
        setUser(null); setGuilds([]); setHomeRecruit(null);
        return;
      }
      setUser(v.user); setGuilds(v.guilds); setHomeRecruit(v.homeRecruit);
      // Theme reconciliation: the server-stored account preference is
      // the truth (same pattern as localePref below).
      setThemePrefState(resolveThemeVariant(v.themePref));
      // Valid session -> silently sync the app push token (skips internally when permission/platform is unsupported)
      void ensurePushRegistration();
      // Locale reconciliation: server storage is the truth; when the local
      // mirror differs, align to the server and trigger one full-tree refetch
      // (the relay layer subscribes to the same event).
      if (v.localePref !== undefined && v.localePref !== readPrefMirror()) {
        writePrefMirror(v.localePref);
        emitLocaleChanged();
      }
    } catch {
      // A network failure never signs the user out: keep state and reconcile on the next refresh
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

  // Locale switch (fired after Profile saves): viewer data is refetched in the new locale to align
  useEffect(() => onLocaleChanged(() => { void refresh(); }), [refresh]);

  const signOut = useCallback(async () => {
    // Unregister the push token first (the mutation needs the current session), then clear the local session
    await unregisterCurrentPushToken();
    await authLogout();
    setUser(null); setGuilds([]); setHomeRecruit(null);
    // Signed out = anonymous, whose effective theme is classic.
    setThemePrefState('classic');
  }, []);

  const value = useMemo(
    () => ({ ready, user, guilds, homeRecruit, text, themePref, setThemePref, refresh, signOut }),
    [ready, user, guilds, homeRecruit, text, themePref, setThemePref, refresh, signOut],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
