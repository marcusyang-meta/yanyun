import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import type { AppViewerQuery as AppViewerQueryType } from './__generated__/AppViewerQuery.graphql';
import type { ViewerUser } from './lib/user';
import LoginPage from './auth/LoginPage.react.tsx';
import GuildPicker from './auth/GuildPicker.react.tsx';
import CreateGuildPage from './auth/CreateGuildPage.react.tsx';
import GuildRouteLoader from './guild/GuildRouteLoader.react.tsx';
import LegalRoute from './LegalRoute.react.tsx';
import SiteFooter from './lib/SiteFooter.react.tsx';
import { readPrefMirror, writePrefMirror, emitLocaleChanged, lastSentLocaleTag } from './lib/locale';
import { canonicalLocaleOf } from './lib/format';
import SiteBackdrop from './lib/SiteBackdrop.react.tsx';

// 全站数据根 = viewer (当前用户), 由 AppEntryPoint 预加载。
// 未登录时 viewer.user 为 null -> 所有路由只渲染登录页。
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
      }
      publicGuilds {
        slug
        name
        slogan
        gameVersion
        memberCount
      }
      siteTitle
      siteSubtitle
      siteHeroAlt
      loginCardTitle
      loginCardBody1
      loginCardBody2
      loginButtonLabel
      loginPrivacyText
      footerDisclaimerText
      footerTermsLabel
      footerPrivacyLabel
      userBarLogoutLabel
      userBarLoggingOutLabel
      userBarSettingsLabel
      myLocalePref
      myEffectiveLocale
      pickerMyGuildsLabel
      pickerMyGuildsEnLabel
      pickerPublicGuildsLabel
      pickerPublicGuildsEnLabel
      pickerReadOnlyBadge
      pickerEmptyTitle
      pickerEmptyBody
      pickerCreateGuildLabel
      pickerCreateGuildMoreLabel
    }
  }
`;

export default function AppRoot({ queries }: {
  queries: { viewerQuery: PreloadedQuery<AppViewerQueryType> };
}) {
  const data = usePreloadedQuery<AppViewerQueryType>(AppViewerQueryNode, queries.viewerQuery);
  const viewer = data.viewer as any;
  const user: ViewerUser | null = viewer.user ?? null;

  // 文案包: 全部来自 viewer 的文案字段 (后端按 locale 生成), 组件只消费。
  const siteText = { title: viewer.siteTitle, subtitle: viewer.siteSubtitle, heroAlt: viewer.siteHeroAlt };
  const loginText = {
    cardTitle: viewer.loginCardTitle, cardBody1: viewer.loginCardBody1, cardBody2: viewer.loginCardBody2,
    buttonLabel: viewer.loginButtonLabel, privacyText: viewer.loginPrivacyText,
  };
  const userBarText = {
    logoutLabel: viewer.userBarLogoutLabel, loggingOutLabel: viewer.userBarLoggingOutLabel,
    settingsLabel: viewer.userBarSettingsLabel,
  };
  const footerText = {
    disclaimer: viewer.footerDisclaimerText,
    termsLabel: viewer.footerTermsLabel,
    privacyLabel: viewer.footerPrivacyLabel,
  };
  const pickerText = {
    myGuildsLabel: viewer.pickerMyGuildsLabel, myGuildsEnLabel: viewer.pickerMyGuildsEnLabel,
    publicGuildsLabel: viewer.pickerPublicGuildsLabel, publicGuildsEnLabel: viewer.pickerPublicGuildsEnLabel,
    readOnlyBadge: viewer.pickerReadOnlyBadge, emptyTitle: viewer.pickerEmptyTitle, emptyBody: viewer.pickerEmptyBody,
    createGuildLabel: viewer.pickerCreateGuildLabel, createGuildMoreLabel: viewer.pickerCreateGuildMoreLabel,
  };

  // 语言对账: 服务端存储的偏好是真相 — 镜像不一致时向服务端看齐;
  // 本次渲染所用语言与服务端生效 locale 不一致时 (如在另一设备改过
  // 偏好), 发切换事件让整树按新语言重取, 无需手动刷新。
  useEffect(() => {
    const serverPref: string | null = viewer.myLocalePref ?? null;
    if (serverPref !== readPrefMirror()) writePrefMirror(serverPref);
    const sentCanonical = canonicalLocaleOf(lastSentLocaleTag() || 'zh-CN');
    if (viewer.myEffectiveLocale && viewer.myEffectiveLocale !== sentCanonical) {
      emitLocaleChanged();
    }
  }, [viewer.myLocalePref, viewer.myEffectiveLocale]);

  return (
    <>
      <SiteBackdrop />
      <div className="yy-app-main">
        <Routes>
      <Route
        path="/"
        element={
          user ? (
            <GuildPicker user={user} guilds={viewer.guilds} publicGuilds={viewer.publicGuilds} site={siteText} text={pickerText} userBarText={userBarText} />
          ) : (
            <LoginPage returnTo="/" site={siteText} text={loginText} />
          )
        }
      />
      {/* 个人资料 (Profile) 改为用户条打开的对话框 (桌面 modal / 移动 pushPage),
          旧 /settings 直链一律回首页, 避免被 /:slug 当作百业 slug */}
      <Route path="/settings" element={<Navigate to="/" replace />} />
      {/* 法律页: 公开可达 (未登录亦可), 静态段优先于 /:slug */}
      <Route path="/terms" element={<LegalRoute kind="TERMS" />} />
      <Route path="/privacy" element={<LegalRoute kind="PRIVACY" />} />
      <Route
        path="/create"
        element={user ? <CreateGuildPage user={user} /> : <LoginPage returnTo="/create" site={siteText} text={loginText} />}
      />
      <Route
        path="/:slug/car/:carId"
        element={user ? <GuildRouteLoader /> : <LoginGateWithText site={siteText} text={loginText} />}
      />
      <Route path="/:slug" element={user ? <GuildRouteLoader /> : <LoginGateWithText site={siteText} text={loginText} />} />
        </Routes>
        {/* 全站页脚: 非官方声明 + 条款/隐私入口 (文案全部后端下发) */}
        <SiteFooter text={footerText} />
      </div>
    </>
  );
}

function LoginGateWithText({ site, text }: { site: any; text: any }) {
  const loc = useLocation();
  return <LoginPage returnTo={loc.pathname + loc.search} site={site} text={text} />;
}
