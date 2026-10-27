import { createContext, useContext, useEffect } from 'react';

// The site footer is rendered once by AppRoot below the routes, but its
// disclaimer is guild-scoped chrome: the backend composes each guild's
// effective footer copy (pageFooterDisclaimerText — the platform
// disclaimer, or null when the guild hides platform branding). Guild
// pages push their value here while mounted; AppRoot renders the
// override instead of the viewer-level text, and no footer at all when
// the override is null. Non-guild pages never push, so they keep the
// platform footer. The client carries no branding logic — it renders
// exactly the copy the server composed.
export type FooterOverride = string | null | undefined;
export const GuildFooterContext = createContext<{ setFooterOverride: (v: FooterOverride) => void }>({
  setFooterOverride: () => {},
});

export function useGuildFooter(disclaimer: string | null | undefined) {
  const { setFooterOverride } = useContext(GuildFooterContext);
  useEffect(() => {
    if (disclaimer === undefined) return;
    setFooterOverride(disclaimer);
    return () => setFooterOverride(undefined);
  }, [disclaimer, setFooterOverride]);
}
