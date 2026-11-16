import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import type { AppViewerQuery as AppViewerQueryType } from './__generated__/AppViewerQuery.graphql';
import type { ViewerUser } from './lib/user';
import LoginPage from './auth/LoginPage.react.tsx';
import LandingPage from './auth/LandingPage.react.tsx';
import GuildPicker from './auth/GuildPicker.react.tsx';
import CreateGuildPage from './auth/CreateGuildPage.react.tsx';
import GuildRouteLoader from './guild/GuildRouteLoader.react.tsx';
import GuildAdminRouteLoader from './guild/GuildAdminRouteLoader.react.tsx';
import LegalRoute from './LegalRoute.react.tsx';
import BuildShareRoute from './BuildShareRoute.react.tsx';
import CarShareRoute from './CarShareRoute.react.tsx';
import CombatReportRoute from './CombatReportRoute.react.tsx';
import SiteFooter from './lib/SiteFooter.react.tsx';
import { hostGuildSlug } from './lib/hostGuild';
import { GuildFooterContext, type FooterOverride } from './lib/guildChrome';
import { readPrefMirror, writePrefMirror, emitLocaleChanged, lastSentLocaleTag } from './lib/locale';
import { syncThemeFromServer } from './lib/theme';
import { canonicalLocaleOf } from './lib/format';
import SiteBackdrop from './lib/SiteBackdrop.react.tsx';

// The app-wide data root is `viewer`, preloaded by AppEntryPoint.
// When logged out, viewer.user is null and every route renders only the login page.
const AppViewerQueryNode = graphql`
  query AppViewerQuery {
    viewer {
      user {
        discordId
        name
        avatar
      }
      guilds {
        slug
        name
        slogan
        gameVersion
        memberCount
        avatarUrl
      }
      siteTitle
      siteSubtitle
      siteHeroAlt
      siteSealText
      loginCardTitle
      loginCardBody1
      loginCardBody2
      loginButtonLabel
      loginPrivacyText
      landingFeaturesTitle
      landingGroupingTitle
      landingGroupingBody
      landingReminderTitle
      landingReminderBody
      landingDexTitle
      landingDexBody
      landingGearTitle
      landingGearBody
      footerDisclaimerText
      footerTermsLabel
      footerPrivacyLabel
      userBarLogoutLabel
      userBarLoggingOutLabel
      userBarSettingsLabel
      myLocalePref
      myEffectiveLocale
      myThemePref
      pickerMyGuildsLabel
      pickerMyGuildsEnLabel
      pickerEmptyTitle
      pickerEmptyBody
      pickerCreateGuildLabel
      pickerCreateGuildMoreLabel
      commonUnknownErrorText
      homeRecruit {
        directoryTitle
        newcomerTitle
        homeBody
        homeLoginHint
        applySectionTitle
        messageLabel
        messagePlaceholder
        submitLabel
        submittingLabel
        myApplicationTitle
        pendingHint
        approvedNextStepText
        rejectedHint
        checklistTitle
        myPairingsTitle
        pairingMentorRoleLabel
        pairingMenteeRoleLabel
        guilds {
          slug
          name
          slogan
          avatarUrl
          myApplicationSection {
            application {
              id
              applicantName
              message
              status
              statusLabel
              createdAtText
              reviewedByName
              reviewedAtText
            }
          }
        }
        myNewcomer {
          slug
          guildName
          checklist {
            progressText
            items { key label hint done }
          }
          myPairings {
            id
            mentorName
            menteeName
            status
            statusLabel
            createdAtText
            endedAtText
          }
        }
      }
    }
  }
`;

export default function AppRoot({ queries }: {
  queries: { viewerQuery: PreloadedQuery<AppViewerQueryType> };
}) {
  const data = usePreloadedQuery<AppViewerQueryType>(AppViewerQueryNode, queries.viewerQuery);
  const viewer = data.viewer as any;

  // The window never scrolls (see index.css shell lock); routed content
  // scrolls inside .yy-scroll-region. Each navigation starts that region
  // back at the top, like a native app shell.
  const scrollRegionRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  useEffect(() => {
    scrollRegionRef.current?.scrollTo(0, 0);
  }, [location.pathname]);
  // Guild subdomain (white-label tier A): on {slug}.yanyun.app the
  // host names the guild — / is its front page, /car/:id and /admin
  // are its pages. In-app links still point at /{slug}/... (the
  // components compose them from the slug), so strip that prefix
  // back off whenever navigation lands on it: the address bar keeps
  // the clean subdomain shapes. On the apex site hostSlug is null
  // and none of this exists.
  const navigate = useNavigate();
  const hostSlug = hostGuildSlug();
  useEffect(() => {
    if (!hostSlug) return;
    const p = location.pathname;
    if (p === `/${hostSlug}` || p.startsWith(`/${hostSlug}/`)) {
      navigate((p.slice(hostSlug.length + 1) || '/') + location.search, { replace: true });
    }
  }, [hostSlug, location.pathname, location.search, navigate]);
  const user: ViewerUser | null = viewer.user ?? null;

  const siteText = { title: viewer.siteTitle, subtitle: viewer.siteSubtitle, heroAlt: viewer.siteHeroAlt, sealText: viewer.siteSealText };
  const loginText = {
    cardTitle: viewer.loginCardTitle, cardBody1: viewer.loginCardBody1, cardBody2: viewer.loginCardBody2,
    buttonLabel: viewer.loginButtonLabel, privacyText: viewer.loginPrivacyText,
  };
  const landingText = {
    featuresTitle: viewer.landingFeaturesTitle,
    groupingTitle: viewer.landingGroupingTitle, groupingBody: viewer.landingGroupingBody,
    reminderTitle: viewer.landingReminderTitle, reminderBody: viewer.landingReminderBody,
    dexTitle: viewer.landingDexTitle, dexBody: viewer.landingDexBody,
    gearTitle: viewer.landingGearTitle, gearBody: viewer.landingGearBody,
  };
  const userBarText = {
    logoutLabel: viewer.userBarLogoutLabel, loggingOutLabel: viewer.userBarLoggingOutLabel,
    settingsLabel: viewer.userBarSettingsLabel,
  };
  // Guild pages override the footer disclaimer with the server-composed
  // per-guild value while mounted (null = no footer: the guild hides
  // platform branding). See lib/guildChrome.
  const [footerOverride, setFooterOverride] = useState<FooterOverride>(undefined);
  const footerChrome = useMemo(() => ({ setFooterOverride }), []);
  const footerText = {
    disclaimer: footerOverride !== undefined ? (footerOverride ?? '') : viewer.footerDisclaimerText,
    termsLabel: viewer.footerTermsLabel,
    privacyLabel: viewer.footerPrivacyLabel,
  };
  const pickerText = {
    myGuildsLabel: viewer.pickerMyGuildsLabel, myGuildsEnLabel: viewer.pickerMyGuildsEnLabel,
    emptyTitle: viewer.pickerEmptyTitle, emptyBody: viewer.pickerEmptyBody,
    createGuildLabel: viewer.pickerCreateGuildLabel, createGuildMoreLabel: viewer.pickerCreateGuildMoreLabel,
  };

  // Locale reconciliation: the server-stored preference is the truth, so the
  // local mirror aligns to it. If this render's language differs from the
  // server's effective locale (e.g. the preference was changed on another
  // device), emit a locale-changed event so the whole tree refetches in the
  // new language without a manual reload.
  useEffect(() => {
    const serverPref: string | null = viewer.myLocalePref ?? null;
    if (serverPref !== readPrefMirror()) writePrefMirror(serverPref);
    const sentCanonical = canonicalLocaleOf(lastSentLocaleTag() || 'zh-CN');
    if (viewer.myEffectiveLocale && viewer.myEffectiveLocale !== sentCanonical) {
      emitLocaleChanged();
    }
  }, [viewer.myLocalePref, viewer.myEffectiveLocale]);

  // Theme reconciliation: same pattern as the locale mirror above —
  // the server's effective theme (myThemePref, 'classic' for anonymous
  // viewers and unset preferences) is the truth, so the root element's
  // data-theme and the local mirror both align to it. The mirror was
  // already applied before first paint (index.html / main.tsx), so a
  // matching server value changes nothing on screen.
  useEffect(() => {
    syncThemeFromServer(viewer.myThemePref);
  }, [viewer.myThemePref]);

  return (
    <>
      <SiteBackdrop />
      <GuildFooterContext.Provider value={footerChrome}>
      <div className="yy-app-main">
        <div className="yy-scroll-region" ref={scrollRegionRef}>
        <Routes>
      <Route
        path="/"
        element={
          user ? (
            hostSlug ? (
              <GuildRouteLoader slugOverride={hostSlug} />
            ) : (
              <GuildPicker user={user} guilds={viewer.guilds} site={siteText} text={pickerText} userBarText={userBarText} recruit={viewer.homeRecruit} unknownError={viewer.commonUnknownErrorText} />
            )
          ) : (
            <LandingPage returnTo="/" site={siteText} text={loginText} landing={landingText} recruit={viewer.homeRecruit} unknownError={viewer.commonUnknownErrorText} />
          )
        }
      />
      {hostSlug ? (
        <>
          <Route
            path="/car/:carId"
            element={user ? <GuildRouteLoader slugOverride={hostSlug} /> : <LoginGateWithText site={siteText} text={loginText} />}
          />
          <Route
            path="/car/:carId/report"
            element={user ? <CombatReportRoute slugOverride={hostSlug} /> : <LoginGateWithText site={siteText} text={loginText} />}
          />
          <Route
            path="/admin"
            element={user ? <GuildAdminRouteLoader slugOverride={hostSlug} /> : <LoginGateWithText site={siteText} text={loginText} />}
          />
          {/* The recruit page was dissolved into the platform home;
              legacy /recruit deep links redirect home — same
              disposition as /gear below */}
          <Route path="/recruit" element={<Navigate to="/" replace />} />
        </>
      ) : null}
      {/* Profile is now a dialog opened from the user bar; legacy /settings
          deep links redirect home so /:slug doesn't capture them as a guild slug */}
      <Route path="/settings" element={<Navigate to="/" replace />} />
      {/* Legal pages are public (reachable logged out); the static segments must win over /:slug */}
      <Route path="/terms" element={<LegalRoute kind="TERMS" />} />
      <Route path="/privacy" element={<LegalRoute kind="PRIVACY" />} />
      {/* Public build share page: anonymous by design (the code is the
          capability); the static segment must win over /:slug */}
      <Route path="/b/:code" element={<BuildShareRoute />} />
      {/* Public car share page: anonymous read-only by design (the
          short-link code is the capability); same precedence rule */}
      <Route path="/s/:code" element={<CarShareRoute />} />
      <Route
        path="/create"
        element={user ? <CreateGuildPage user={user} /> : <LoginPage returnTo="/create" site={siteText} text={loginText} />}
      />
      {/* The gear library is a dialog page opened from Profile (UserBar);
          legacy /gear deep links redirect home so /:slug doesn't capture
          them as a guild slug — same disposition as /settings above */}
      <Route path="/gear" element={<Navigate to="/" replace />} />
      <Route
        path="/:slug/car/:carId"
        element={user ? <GuildRouteLoader /> : <LoginGateWithText site={siteText} text={loginText} />}
      />
      <Route
        path="/:slug/car/:carId/report"
        element={user ? <CombatReportRoute /> : <LoginGateWithText site={siteText} text={loginText} />}
      />
      <Route
        path="/:slug/admin"
        element={user ? <GuildAdminRouteLoader /> : <LoginGateWithText site={siteText} text={loginText} />}
      />
      {/* The recruit page was dissolved into the platform home;
          legacy /:slug/recruit deep links redirect home — same
          disposition as /gear above */}
      <Route path="/:slug/recruit" element={<Navigate to="/" replace />} />
      <Route path="/:slug" element={user ? <GuildRouteLoader /> : <LoginGateWithText site={siteText} text={loginText} />} />
        </Routes>
        </div>
        {/* Site-wide footer: unofficial disclaimer + terms/privacy links (all copy backend-delivered).
            In flow below the scroll region, so it is always fully on screen. */}
        <SiteFooter text={footerText} />
      </div>
      </GuildFooterContext.Provider>
    </>
  );
}

function LoginGateWithText({ site, text }: { site: any; text: any }) {
  const loc = useLocation();
  return <LoginPage returnTo={loc.pathname + loc.search} site={site} text={text} />;
}
