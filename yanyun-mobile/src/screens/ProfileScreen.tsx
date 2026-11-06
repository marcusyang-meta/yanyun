import React, { Suspense, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { ProfilePageQuery } from '../documents';
import GearLibraryDialog from './GearLibraryDialog';
import AvailabilityDialog from './AvailabilityDialog';
import {
  cancelAccountDeletionRemote,
  exportMyDataRemote,
  requestAccountDeletionRemote,
  resetCalendarFeedRemote,
  updateMyLocale,
} from '../api';
import { reauthWithDiscord } from '../auth';
import { emitLocaleChanged, writePrefMirror } from '../locale';
import { useSession } from '../session';
import type { documentsProfilePageQuery } from '../__generated__/documentsProfilePageQuery.graphql';

// Profile (same content and switch semantics as Web Profile; a push page
// on mobile): identity (avatar + nickname + Discord account) + locale
// preference (stored per account in users.locale_pref; follow-device +
// five languages) + entry rows to the gear library dialog page (a
// page-level Modal this page opens in place — Profile is a page, not a
// dialog, so the Modal is a single layer) and to the
// feedback page (/feedback) + sign-out. All
// copy on this page comes from settingsPage / viewer shell fields per
// locale; this file holds no UI copy (language option labels are also
// backend settingsLang* fields).
// Switch flow mirrors Web: tapping first applies a local override (the
// control reflects it immediately) -> updateMyLocale -> on success,
// write the preference mirror, then fire the switch event; the relay
// layer refetches all registered queries with the new x-locale (incl.
// this page) and the UI switches language in place; once the server
// value catches up the override is dropped; on failure the override is
// dropped and the server error is shown.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
        <Suspense fallback={<LoadingView />}>
          <ProfileInner topInset={insets.top} bottomInset={insets.bottom} />
        </Suspense>
      </AsyncBoundary>
    </View>
  );
}

function ProfileInner({ topInset, bottomInset }: { topInset: number; bottomInset: number }) {
  const router = useRouter();
  const { user, signOut } = useSession();
  const data = useLazyLoadQuery<documentsProfilePageQuery>(
    ProfilePageQuery, {}, { fetchPolicy: 'store-or-network' },
  );
  const page = data.settingsPage;
  const viewer = data.viewer;
  const [picked, setPicked] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [gearOpen, setGearOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  /* ---- My Data (account export / deletion) ---- */
  const environment = useRelayEnvironment();
  const [acctView, setAcctView] = useState<'main' | 'confirm'>('main');
  const [typedName, setTypedName] = useState('');
  const [acctBusy, setAcctBusy] = useState(false);
  const [acctError, setAcctError] = useState('');
  const [acctNotice, setAcctNotice] = useState('');
  const pendingDeletion = page?.accountPendingDeletion ?? null;
  // Freshness is judged against the moment this screen (re)loaded —
  // the mutations re-check the stamp server-side regardless.
  const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
  const authFresh = typeof page?.freshAuthAt === 'number'
    && (nowSec - page.freshAuthAt) <= 600;

  const refetchSelf = () => {
    setNowSec(Math.floor(Date.now() / 1000));
    fetchQuery(environment, ProfilePageQuery, {}).toPromise().catch(() => {});
  };

  // Sensitive actions need a fresh Discord OAuth stamp (server-side
  // gate): when stale, run the same auth round trip as login first —
  // the callback stamps fresh_auth_at; the mutation re-checks anyway.
  const ensureFresh = async (): Promise<boolean> => {
    if (authFresh) return true;
    const ok = await reauthWithDiscord();
    if (ok) refetchSelf();
    return ok;
  };

  const deliverExport = async (json: string, filename: string) => {
    try {
      const file = new File(Paths.cache, filename);
      file.create({ overwrite: true });
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: filename });
        return;
      }
    } catch { /* fall through to the plain text share below */ }
    await Share.share({ message: json });
  };

  const doExport = async () => {
    if (acctBusy) return;
    setAcctError('');
    setAcctBusy(true);
    try {
      await ensureFresh();
      let payload = await exportMyDataRemote();
      if (!payload.ok && payload.errorCode === 'accountReauthRequired') {
        if (await reauthWithDiscord()) payload = await exportMyDataRemote();
      }
      if (payload.ok && payload.json) {
        await deliverExport(payload.json, payload.filename || 'yanyun-data-export.json');
      } else {
        setAcctError(payload.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setAcctError(viewer?.commonUnknownErrorText || '');
    } finally { setAcctBusy(false); }
  };

  const doRequestDeletion = async () => {
    if (acctBusy) return;
    setAcctError('');
    setAcctBusy(true);
    try {
      await ensureFresh();
      let payload = await requestAccountDeletionRemote(typedName);
      if (!payload.ok && payload.errorCode === 'accountReauthRequired') {
        if (await reauthWithDiscord()) payload = await requestAccountDeletionRemote(typedName);
      }
      if (payload.ok) {
        setAcctView('main');
        setTypedName('');
        setAcctNotice(page?.accountDeletionRequestedText || '');
        refetchSelf();
      } else {
        setAcctError(payload.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setAcctError(viewer?.commonUnknownErrorText || '');
    } finally { setAcctBusy(false); }
  };

  // Calendar subscription: the member's own iCal feed URL with
  // copy + token reset. The URL is composed by the backend (token
  // lazy-minted on the settings read); copy goes to the clipboard
  // with the backend's copied text as the inline confirmation, and
  // reset rotates the token server-side, after which this page
  // refetches and shows the backend's reset-done text.
  const calFeed = page?.calendarFeed ?? null;
  const [calCopied, setCalCopied] = useState(false);
  const [calResetDone, setCalResetDone] = useState(false);
  const [calError, setCalError] = useState('');
  const [calBusy, setCalBusy] = useState(false);
  const doCopyCalUrl = async () => {
    if (!calFeed?.calendarUrl) return;
    try {
      await Clipboard.setStringAsync(calFeed.calendarUrl);
      setCalCopied(true);
    } catch { /* the URL stays selectable on screen for a manual copy */ }
  };
  const doResetCalUrl = async () => {
    if (calBusy) return;
    setCalError('');
    setCalBusy(true);
    try {
      const payload = await resetCalendarFeedRemote();
      if (payload.ok) {
        setCalResetDone(true);
        setCalCopied(false);
        refetchSelf();
      } else {
        setCalError(payload.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setCalError(viewer?.commonUnknownErrorText || '');
    } finally { setCalBusy(false); }
  };

  const doCancelDeletion = async () => {
    if (acctBusy) return;
    setAcctError('');
    setAcctBusy(true);
    try {
      const payload = await cancelAccountDeletionRemote();
      if (payload.ok) {
        setAcctNotice(page?.accountDeletionCancelledText || '');
        refetchSelf();
      } else {
        setAcctError(payload.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setAcctError(viewer?.commonUnknownErrorText || '');
    } finally { setAcctBusy(false); }
  };

  const serverCurrent: string = page?.localePref ?? 'AUTO';
  // The local override applies only while it differs from the server value;
  // once the server catches up it yields automatically (render-phase
  // derivation, no effect writing state back).
  const current = picked !== null && picked !== serverCurrent ? picked : serverCurrent;

  if (!page) return <LoadingView />;

  const options: { value: string; label: string }[] = [
    { value: 'AUTO', label: page.settingsAutoLabel },
    { value: 'zh-CN', label: page.settingsLangZhCnLabel },
    { value: 'zh-TW', label: page.settingsLangZhTwLabel },
    { value: 'en', label: page.settingsLangEnLabel },
    { value: 'es', label: page.settingsLangEsLabel },
    { value: 'fr', label: page.settingsLangFrLabel },
  ];

  const choose = async (value: string) => {
    if (inFlight || value === current) return;
    setPicked(value);
    setError('');
    setSaved(false);
    setInFlight(true);
    try {
      const payload = await updateMyLocale(value === 'AUTO' ? null : value);
      if (payload?.ok) {
        writePrefMirror(payload.localePref ?? null);
        emitLocaleChanged();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setPicked(null);
        setError(payload?.error || viewer?.commonUnknownErrorText || '');
      }
    } catch {
      setPicked(null);
      setError(viewer?.commonUnknownErrorText || '');
    } finally { setInFlight(false); }
  };

  const doSignOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await signOut();
    router.replace('/');
  };

  return (
    <>
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 12 + topInset,
        paddingBottom: 32 + bottomInset,
      }}
    >
      <View style={s.head}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>{page.settingsTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      {!!user && (
        <View style={s.identity}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitial}>{(user.name || '?').slice(0, 1)}</Text>
            </View>
          )}
          <View>
            <Text style={s.userName}>{user.name}</Text>
            <Text style={s.userMeta}>{page.settingsDiscordLabel} · {user.discordId}</Text>
          </View>
        </View>
      )}

      <Text style={s.langLabel}>{page.settingsLanguageLabel}</Text>
      <Text style={s.langHint}>{page.settingsLanguageHint}</Text>
      <View style={s.options}>
        {options.map((opt) => {
          const active = opt.value === current;
          return (
            <Pressable
              key={opt.value}
              style={[s.option, active && s.optionOn]}
              onPress={() => void choose(opt.value)}
              disabled={inFlight}
            >
              <Text style={[s.optionText, active && s.optionTextOn]}>{opt.label}</Text>
              {active && <Text style={s.optionDot}>●</Text>}
            </Pressable>
          );
        })}
      </View>
      {saved && <Text style={s.saved}>✓ {page.settingsSavedText}</Text>}
      {!!error && <Text style={s.error}>{error}</Text>}

      {/* Entry to the gear library dialog page: the library and my builds
          open as a page-level Modal over this page (GearLibraryDialog),
          not embedded here and not a pushed route. The feedback entry
          sits in the same zone, pushing /feedback. */}
      <View style={s.gearZone}>
        <Pressable style={s.entryRow} onPress={() => setGearOpen(true)}>
          <Text style={s.entryText}>{data.gradPage?.gearMyLibTitle}</Text>
          <Text style={s.entryChevron}>›</Text>
        </Pressable>
        <Pressable style={[s.entryRow, { marginTop: 8 }]} onPress={() => router.push('/feedback')}>
          <Text style={s.entryText}>{page.feedbackEntryLabel}</Text>
          <Text style={s.entryChevron}>›</Text>
        </Pressable>
        {/* Availability editor entry: the editor is a dialog page of
            this Profile host (AvailabilityDialog), the only place
            availability is edited — the guild schedule tab no longer
            carries it. */}
        <Pressable style={[s.entryRow, { marginTop: 8 }]} onPress={() => setAvailOpen(true)}>
          <Text style={s.entryText}>{page.availabilityTitle}</Text>
          <Text style={s.entryChevron}>›</Text>
        </Pressable>
      </View>

      {/* Calendar subscription: the member's personal iCal feed.
          The section exists only when the backend composed it (a
          signed-in member); the URL is the credential, so it renders
          only here, in the owner's own profile. */}
      {calFeed && (
        <View style={s.gearZone}>
          <Text style={s.langLabel}>{calFeed.calendarSectionTitle}</Text>
          <Text style={s.calHint}>{calFeed.calendarHintText}</Text>
          <Text style={s.calUrl} selectable>{calFeed.calendarUrl}</Text>
          <View style={s.calRow}>
            <Pressable style={s.calCopyBtn} onPress={() => void doCopyCalUrl()}>
              <Text style={s.calCopyText}>{calFeed.calendarCopyLabel}</Text>
            </Pressable>
            <Pressable style={[s.calResetBtn, calBusy && s.btnDisabled]} onPress={() => void doResetCalUrl()} disabled={calBusy}>
              <Text style={s.calResetText}>{calFeed.calendarResetLabel}</Text>
            </Pressable>
          </View>
          {calCopied && <Text style={s.saved}>✓ {calFeed.calendarCopiedText}</Text>}
          {calResetDone && <Text style={s.saved}>✓ {calFeed.calendarResetDoneText}</Text>}
          {!!calError && <Text style={s.error}>{calError}</Text>}
        </View>
      )}

      {/* My Data: account export + deletion (self-service). The pending
          state arrives as data (accountPendingDeletion present/absent),
          never as a flag to interpret; all gates are enforced again by
          the mutations server-side. Mirrors the Web Profile dialog. */}
      <View style={s.gearZone}>
        <Text style={s.langLabel}>{page.accountSectionTitle}</Text>
        {pendingDeletion ? (
          <View style={s.pendingBox}>
            <Text style={s.pendingTitle}>{pendingDeletion.accountPendingTitle}</Text>
            <Text style={s.pendingBody}>{pendingDeletion.accountPendingBody}</Text>
            <Pressable style={s.cancelDeletionBtn} onPress={() => void doCancelDeletion()} disabled={acctBusy}>
              <Text style={s.cancelDeletionText}>{page.accountCancelDeletionLabel}</Text>
            </Pressable>
          </View>
        ) : acctView === 'confirm' ? (
          <View>
            <Text style={s.pendingTitle}>{page.accountConfirmTitle}</Text>
            <Text style={s.pendingBody}>{page.accountConfirmIntro}</Text>
            <View style={s.consequences}>
              <Text style={s.consequence}>· {page.accountConsequenceCars}</Text>
              <Text style={s.consequence}>· {page.accountConsequenceData}</Text>
              <Text style={s.consequence}>· {page.accountConsequenceGuilds}</Text>
              <Text style={s.consequence}>· {page.accountConsequenceResidual}</Text>
              <Text style={s.consequence}>· {page.accountConsequenceReregister}</Text>
            </View>
            <Text style={s.pendingBody}>
              {page.accountExportFirstHint}
              <Text style={s.inlineLink} onPress={() => void doExport()}>{page.accountExportLabel}</Text>
            </Text>
            <Text style={s.langLabel}>{page.accountUsernameLabel}</Text>
            <TextInput
              style={s.nameInput}
              value={typedName}
              onChangeText={setTypedName}
              placeholder={user?.name || ''}
              placeholderTextColor={theme.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={s.confirmRow}>
              <Pressable
                style={s.backBtn}
                onPress={() => { setAcctView('main'); setAcctError(''); }}
              >
                <Text style={s.backText}>{page.accountBackLabel}</Text>
              </Pressable>
              <Pressable
                style={[s.submitDangerBtn, (acctBusy || typedName.trim() === '' || typedName.trim() !== (user?.name || '').trim()) && s.btnDisabled]}
                onPress={() => void doRequestDeletion()}
                disabled={acctBusy || typedName.trim() === '' || typedName.trim() !== (user?.name || '').trim()}
              >
                <Text style={s.dangerText}>{page.accountSubmitLabel}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            <Pressable style={s.entryRow} onPress={() => void doExport()} disabled={acctBusy}>
              <Text style={s.entryText}>{page.accountExportLabel}</Text>
              <Text style={s.entryChevron}>›</Text>
            </Pressable>
            <Text style={s.acctHint}>{page.accountExportHint}</Text>
            {!authFresh && <Text style={s.acctHint}>{page.accountReauthHint}</Text>}
            <Pressable style={s.dangerBtn} onPress={() => setAcctView('confirm')} disabled={acctBusy}>
              <Text style={s.dangerText}>{page.accountDeleteLabel}</Text>
            </Pressable>
            <Text style={s.acctHint}>{page.accountDeleteHint}</Text>
          </View>
        )}
        {!!acctNotice && <Text style={s.saved}>✓ {acctNotice}</Text>}
        {!!acctError && <Text style={s.error}>{acctError}</Text>}
      </View>

      <View style={s.logoutZone}>
        <Pressable style={s.logoutBtn} onPress={() => void doSignOut()} disabled={loggingOut}>
          <Text style={s.logoutText}>
            {loggingOut ? viewer?.userBarLoggingOutLabel : viewer?.userBarLogoutLabel}
          </Text>
        </Pressable>
      </View>

      {/* Footer: unofficial disclaimer + terms/privacy links (copy from the
          backend; links open the site's legal pages, text is not bundled) */}
      <View style={s.footer}>
        {!!viewer?.footerDisclaimerText && <Text style={s.footerText}>{viewer.footerDisclaimerText}</Text>}
        <View style={s.footerLinks}>
          {!!viewer?.footerTermsLabel && (
            <Pressable onPress={() => void Linking.openURL('https://yanyun.app/terms')}>
              <Text style={s.footerLink}>{viewer.footerTermsLabel}</Text>
            </Pressable>
          )}
          {!!viewer?.footerPrivacyLabel && (
            <Pressable onPress={() => void Linking.openURL('https://yanyun.app/privacy')}>
              <Text style={s.footerLink}>{viewer.footerPrivacyLabel}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
    {gearOpen && <GearLibraryDialog onClose={() => setGearOpen(false)} />}
    {availOpen && <AvailabilityDialog onClose={() => setAvailOpen(false)} />}
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  back: { color: theme.gold, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 3 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: theme.gold },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,163,92,.12)' },
  avatarInitial: { color: theme.goldHi, fontSize: 19, fontFamily: fonts.serif },
  userName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 16.5 },
  userMeta: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 2 },
  langLabel: { fontFamily: fonts.serif, color: theme.paper, fontSize: 16, marginBottom: 6 },
  langHint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 22, marginBottom: 16 },
  options: { gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(201,163,92,.25)',
  },
  optionOn: { backgroundColor: 'rgba(201,163,92,.14)', borderColor: theme.gold },
  optionText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14.5 },
  optionTextOn: { color: theme.goldHi },
  optionDot: { color: theme.gold, fontSize: 13 },
  saved: { fontFamily: fonts.serif, color: '#7fb069', fontSize: 13, marginTop: 14 },
  error: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13, marginTop: 14 },
  gearZone: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.22)', marginTop: 26, paddingTop: 18 },
  entryRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,.02)', borderWidth: 1, borderColor: 'rgba(201,163,92,.25)',
  },
  entryText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14.5 },
  entryChevron: { fontFamily: fonts.serif, color: theme.gold, fontSize: 19, lineHeight: 21 },
  acctHint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, lineHeight: 20, marginTop: 8, marginBottom: 14 },
  pendingBox: {
    borderWidth: 1, borderColor: 'rgba(229,141,127,.45)', borderRadius: 10,
    padding: 14, backgroundColor: 'rgba(229,141,127,.06)',
  },
  pendingTitle: { fontFamily: fonts.serif, color: theme.danger, fontSize: 15, marginBottom: 6 },
  pendingBody: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 21, marginBottom: 12 },
  consequences: { marginBottom: 12, gap: 2 },
  consequence: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 21 },
  inlineLink: { color: theme.gold, textDecorationLine: 'underline' },
  nameInput: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,.03)', color: theme.paper,
    fontFamily: fonts.serif, fontSize: 14, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 14,
  },
  confirmRow: { flexDirection: 'row', gap: 10 },
  backBtn: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', borderRadius: 8,
    paddingVertical: 11, alignItems: 'center',
  },
  backText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  dangerBtn: {
    borderWidth: 1, borderColor: 'rgba(229,141,127,.45)', borderRadius: 10,
    backgroundColor: 'rgba(229,141,127,.06)', paddingVertical: 12, alignItems: 'center',
  },
  submitDangerBtn: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(229,141,127,.6)', borderRadius: 8,
    backgroundColor: 'rgba(229,141,127,.14)', paddingVertical: 11, alignItems: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  dangerText: { fontFamily: fonts.serif, color: theme.danger, fontSize: 14.5 },
  cancelDeletionBtn: {
    borderWidth: 1, borderColor: theme.gold, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  cancelDeletionText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5 },
  calHint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 20, marginBottom: 12 },
  calUrl: {
    fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.25)', borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,.03)', paddingVertical: 10, paddingHorizontal: 12,
    marginBottom: 10,
  },
  calRow: { flexDirection: 'row', gap: 8 },
  calCopyBtn: {
    flex: 1, borderWidth: 1, borderColor: theme.gold, borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  calCopyText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5 },
  calResetBtn: {
    flex: 1, borderWidth: 1, borderColor: 'rgba(201,163,92,.3)', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center',
  },
  calResetText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13.5 },
  logoutZone: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.22)', marginTop: 26, paddingTop: 18 },
  logoutBtn: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  logoutText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  footer: { marginTop: 30 },
  footerText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 22, marginTop: 10 },
  footerLink: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13 },
});
