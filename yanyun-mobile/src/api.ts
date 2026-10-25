import { commitMutation, fetchQuery, type GraphQLTaggedNode, type MutationParameters } from 'relay-runtime';
import { relayEnvironment } from './relay';
import {
  CreateGroupingMutation,
  DisbandGroupingMutation,
  JoinGroupingMutation,
  LeaveGroupingMutation,
  RegisterPushTokenMutation,
  UnregisterPushTokenMutation,
  UpdateGroupingMutation,
  UpdateMyLocaleMutation,
  ViewerQuery,
} from './documents';
import type { documentsViewerQuery } from './__generated__/documentsViewerQuery.graphql';
import type { documentsJoinGroupingMutation } from './__generated__/documentsJoinGroupingMutation.graphql';
import type { documentsLeaveGroupingMutation } from './__generated__/documentsLeaveGroupingMutation.graphql';
import type { documentsDisbandGroupingMutation } from './__generated__/documentsDisbandGroupingMutation.graphql';
import type { documentsCreateGroupingMutation } from './__generated__/documentsCreateGroupingMutation.graphql';
import type { documentsUpdateGroupingMutation } from './__generated__/documentsUpdateGroupingMutation.graphql';
import type { documentsUpdateMyLocaleMutation } from './__generated__/documentsUpdateMyLocaleMutation.graphql';
import type { documentsRegisterPushTokenMutation } from './__generated__/documentsRegisterPushTokenMutation.graphql';
import type { documentsUnregisterPushTokenMutation } from './__generated__/documentsUnregisterPushTokenMutation.graphql';

// 数据层 = Relay (与网站同一个 GraphQL 契约, 同一份 schema)。
// 会话走 Authorization Bearer (relay.ts 的 fetch 函数注入), 后端与 cookie
// 同一条校验路径 (含 Discord 授权完整性/吊销检查) —— 失效在 viewer 里
// 表现为 user=null, session.tsx 据此清本地令牌回登录页。

export type DiscordUser = { discordId: string; name: string; avatar?: string | null };
export type GuildItem = {
  slug: string;
  name?: string | null;
  slogan?: string | null;
  gameVersion?: string | null;
  memberCount: number;
  viewerNick?: string | null;
  // 百业主页分区胶囊文案 (Guild/GuildReadOnly shell 按 locale 下发, 与 Web GuildHome 同源)
  homeTabTeamLabel?: string | null;
  homeTabDexLabel?: string | null;
  homeTabSectLabel?: string | null;
  readOnly: boolean;
};

// 站点/登录/选择器文案包: 与 Web AppViewerQuery 同一组 viewer 文案字段,
// 全部由后端按 locale 生成, 组件只消费 (与 Web 同构的关键)。
export type SiteText = {
  siteTitle?: string | null;
  siteSubtitle?: string | null;
  loginCardTitle?: string | null;
  loginCardBody1?: string | null;
  loginCardBody2?: string | null;
  loginButtonLabel?: string | null;
  loginPrivacyText?: string | null;
  userBarSettingsLabel?: string | null;
  userBarLogoutLabel?: string | null;
  userBarLoggingOutLabel?: string | null;
  pickerMyGuildsLabel?: string | null;
  pickerMyGuildsEnLabel?: string | null;
  pickerPublicGuildsLabel?: string | null;
  pickerPublicGuildsEnLabel?: string | null;
  pickerReadOnlyBadge?: string | null;
  pickerEmptyTitle?: string | null;
  pickerEmptyBody?: string | null;
  commonUnknownErrorText?: string | null;
  commonRenderErrorTemplate?: string | null;
  commonRenderErrorHint?: string | null;
};
export type Seat = {
  index: number;
  nickname?: string | null;
  weapon?: string | null;
  role?: string | null;
  uid?: string | null;
  occupied: boolean;
};
export type SeatPayload = { ok: boolean; error?: string | null; seats?: Seat[] | null };

export type ViewerData = {
  user: DiscordUser | null;
  guilds: GuildItem[];
  publicGuilds: GuildItem[];
  localePref?: string | null;
  text: SiteText;
};

export async function fetchViewer(): Promise<ViewerData> {
  const data = await fetchQuery<documentsViewerQuery>(relayEnvironment, ViewerQuery, {}).toPromise();
  const viewer = data?.viewer;
  return {
    user: viewer?.user
      ? { discordId: viewer.user.discordId, name: viewer.user.name, avatar: viewer.user.avatar }
      : null,
    guilds: (viewer?.guilds ?? []).map((g) => ({ ...g, readOnly: false })),
    publicGuilds: (viewer?.publicGuilds ?? []).map((g) => ({ ...g, readOnly: true })),
    localePref: viewer?.myLocalePref ?? null,
    text: {
      siteTitle: viewer?.siteTitle,
      siteSubtitle: viewer?.siteSubtitle,
      loginCardTitle: viewer?.loginCardTitle,
      loginCardBody1: viewer?.loginCardBody1,
      loginCardBody2: viewer?.loginCardBody2,
      loginButtonLabel: viewer?.loginButtonLabel,
      loginPrivacyText: viewer?.loginPrivacyText,
      userBarSettingsLabel: viewer?.userBarSettingsLabel,
      userBarLogoutLabel: viewer?.userBarLogoutLabel,
      userBarLoggingOutLabel: viewer?.userBarLoggingOutLabel,
      pickerMyGuildsLabel: viewer?.pickerMyGuildsLabel,
      pickerMyGuildsEnLabel: viewer?.pickerMyGuildsEnLabel,
      pickerPublicGuildsLabel: viewer?.pickerPublicGuildsLabel,
      pickerPublicGuildsEnLabel: viewer?.pickerPublicGuildsEnLabel,
      pickerReadOnlyBadge: viewer?.pickerReadOnlyBadge,
      pickerEmptyTitle: viewer?.pickerEmptyTitle,
      pickerEmptyBody: viewer?.pickerEmptyBody,
      commonUnknownErrorText: viewer?.commonUnknownErrorText,
      commonRenderErrorTemplate: viewer?.commonRenderErrorTemplate,
      commonRenderErrorHint: viewer?.commonRenderErrorHint,
    },
  };
}

function commit<T extends MutationParameters>(mutation: GraphQLTaggedNode, variables: T['variables']): Promise<T['response']> {
  return new Promise<T['response']>((resolve, reject) => {
    commitMutation<T>(relayEnvironment, {
      mutation,
      variables,
      onCompleted: (response) => resolve(response),
      onError: (err) => reject(err),
    });
  });
}

export async function joinGrouping(
  groupingId: string,
  nickname: string,
  weapon: string,
  seatIndex: number,
): Promise<SeatPayload> {
  const r = await commit<documentsJoinGroupingMutation>(JoinGroupingMutation, {
    input: { groupingId, nickname, weapon, seatIndex },
  });
  return r.joinGrouping as SeatPayload;
}

export async function leaveGrouping(groupingId: string, uid: string): Promise<SeatPayload> {
  const r = await commit<documentsLeaveGroupingMutation>(LeaveGroupingMutation, {
    input: { groupingId, uid },
  });
  return r.leaveGrouping as SeatPayload;
}

export async function disbandGrouping(id: string): Promise<{ ok: boolean; error?: string | null }> {
  const r = await commit<documentsDisbandGroupingMutation>(DisbandGroupingMutation, { id });
  return r.disbandGrouping;
}

export type GroupingPayload = {
  ok: boolean;
  error?: string | null;
  grouping?: { id: string; title: string } | null;
};

export async function createGrouping(input: {
  slug: string;
  title: string;
  type: 'ACTIVITY' | 'TALENT' | 'RACE' | 'TOWER';
  startsAt: string;
  dungeonId?: string | null;
  seats?: { nickname: string; weapon: string }[];
}): Promise<GroupingPayload> {
  const r = await commit<documentsCreateGroupingMutation>(CreateGroupingMutation, { input });
  return r.createGrouping as GroupingPayload;
}

export async function updateGrouping(
  id: string,
  input: { title?: string; startsAt?: string },
): Promise<GroupingPayload> {
  const r = await commit<documentsUpdateGroupingMutation>(UpdateGroupingMutation, { id, input });
  return r.updateGrouping as GroupingPayload;
}

export type LocalePayload = {
  ok: boolean;
  error?: string | null;
  localePref?: string | null;
  effectiveLocale?: string | null;
};

export async function updateMyLocale(locale: string | null): Promise<LocalePayload> {
  const r = await commit<documentsUpdateMyLocaleMutation>(UpdateMyLocaleMutation, { locale });
  return r.updateMyLocale as LocalePayload;
}

/* ---------- App 推送令牌 ---------- */

export type PushTokenPayload = { ok: boolean; error?: string | null; errorCode?: string | null };

export async function registerPushTokenRemote(token: string, platform: string): Promise<PushTokenPayload> {
  const r = await commit<documentsRegisterPushTokenMutation>(RegisterPushTokenMutation, { token, platform });
  return r.registerPushToken as PushTokenPayload;
}

export async function unregisterPushTokenRemote(token: string): Promise<PushTokenPayload> {
  const r = await commit<documentsUnregisterPushTokenMutation>(UnregisterPushTokenMutation, { token });
  return r.unregisterPushToken as PushTokenPayload;
}
