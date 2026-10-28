import React, { Suspense, useState } from 'react';
import {
  Image, Linking, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { fonts, theme } from '../theme';
import { Backdrop } from '../components/ui';
import { LoadingView } from '../components/AsyncBoundary';
import { GuildAdminQuery } from '../documents';
import { AnnouncementsAdminPanel } from './AnnouncementsView';
import {
  adminAddResult, adminCreateEvent, adminDeleteAvatar,
  adminDeleteEvent, adminDeleteResult, adminRemoveSignup,
  adminSetAvatar, adminUpdateDiscord, adminUpdateEvent, adminUpdateGuide,
  adminStartPremiumCheckout,
  adminCreateLottery, adminDrawLottery,
  adminReviewGuildApplication, adminSetGuildMentor, adminCreateMentorPairing, adminEndMentorPairing,
  adminUpdateRecruitOpen,
  adminUpsertGearStandard, adminDeleteGearStandard,
  adminUpdateProfile, adminUpdateReminderSettings, adminUpdateVisibility,
  adminUpdateWhiteLabel,
  adminBindCustomDomain,
  adminVerifyCustomDomain,
  adminRemoveCustomDomain,
  adminSetSeasonChecklistItem, adminDeleteRosterEntry,
  adminPreviewRosterImport, adminConfirmRosterImport,
  type AdminPayload, type RosterImportPayload,
} from '../api';
import { activeRecognizer, ocrPrepare, ocrEnhance, pickImageFiles } from '../gear/GearOcrEngine';
import { fill } from '../gear/bits';
import type { documentsGuildAdminQuery } from '../__generated__/documentsGuildAdminQuery.graphql';

// Guild admin (mobile): isomorphic with the Web admin page — same
// GraphQL surface, same backend copy (every label is a field on the
// GuildAdmin type), same rules. Response type decides everything:
// GuildAdminLocked renders the locked card; GuildAdmin renders the
// panels. Destructive actions arm on first tap and fire on second
// (no native confirm dialogs).
type Admin = Extract<
  NonNullable<documentsGuildAdminQuery['response']['viewer']>['guildAdmin'],
  { __typename: 'GuildAdmin' }
>;
type Text_ = Admin;
const ConfirmCtx = React.createContext('');

export default function GuildAdminScreen({ slug }: { slug: string }) {
  const insets = useSafeAreaInsets();
  const [epoch, setEpoch] = useState(0);
  return (
    <View style={s.root}>
      <Backdrop />
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Suspense fallback={<LoadingView />}>
          <AdminLoader slug={slug} epoch={epoch} refresh={() => setEpoch((e) => e + 1)} />
        </Suspense>
      </View>
    </View>
  );
}

function AdminLoader({ slug, epoch, refresh }: { slug: string; epoch: number; refresh: () => void }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsGuildAdminQuery>(
    GuildAdminQuery,
    { slug },
    { fetchPolicy: 'store-or-network', fetchKey: epoch },
  );
  const ga: any = data.viewer?.guildAdmin;
  const unknownError = data.viewer?.commonUnknownErrorText ?? '';
  const confirmLabel = data.viewer?.commonConfirmLabel ?? '';
  const cancelLabel = data.viewer?.commonCancelLabel ?? '';
  if (!ga || ga.__typename === 'GuildAdminLocked') {
    return (
      <View style={s.lockWrap}>
        <Text style={s.lockTitle}>{ga?.adminLockedTitle ?? ''}</Text>
        <Text style={s.lockBody}>{ga?.adminLockedBody ?? ''}</Text>
        <Pressable style={s.ghostBtn} onPress={() => router.back()}>
          <Text style={s.ghostBtnText}>{ga?.adminBackLinkLabel ?? ''}</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <ConfirmCtx.Provider value={confirmLabel}>
      <AdminMain key={epoch} admin={ga as Admin} unknownError={unknownError} cancelLabel={cancelLabel} refresh={refresh} router={router} />
    </ConfirmCtx.Provider>
  );
}

function AdminMain({ admin, unknownError, cancelLabel, refresh, router }: {
  admin: Admin; unknownError: string; cancelLabel: string; refresh: () => void; router: ReturnType<typeof useRouter>;
}) {
  const [tab, setTab] = useState<'profile' | 'discord' | 'events' | 'guides' | 'announcements' | 'stats' | 'insights' | 'tools' | 'season' | 'recruit'>('profile');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const run = async (p: Promise<AdminPayload>, onOk?: () => void) => {
    setError('');
    try {
      const r = await p;
      if (r.ok) { onOk?.(); refresh(); }
      else setError(r.error || unknownError);
    } catch { setError(unknownError); }
  };
  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'profile', label: admin.adminTabProfileLabel },
    { key: 'discord', label: admin.adminTabDiscordLabel },
    { key: 'events', label: admin.adminTabEventsLabel },
    { key: 'guides', label: admin.adminTabGuidesLabel },
    { key: 'announcements', label: admin.adminTabAnnouncementsLabel },
    { key: 'stats', label: admin.adminTabStatsLabel },
    { key: 'insights', label: (admin as any).adminTabInsightsLabel },
    { key: 'tools', label: admin.adminTabToolsLabel },
    { key: 'season', label: admin.adminTabSeasonLabel },
    { key: 'recruit', label: (admin as any).adminTabRecruitLabel },
  ];
  const premium: any = (admin as any).premium ?? null;
  const premiumLocked = premium?.__typename === 'GuildAdminPremiumLocked' ? premium : null;
  const premiumActive = premium?.__typename === 'GuildAdminPremiumActive' ? premium : null;
  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.head}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={s.back}>‹</Text>
        </Pressable>
        <Text style={s.title}>{admin.adminTitle}</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={s.tabs}>
        {tabs.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[s.tab, tab === t.key && s.tabOn]}>
            <Text style={[s.tabText, tab === t.key && s.tabTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
      {!!error && <Text style={s.error}>{error}</Text>}
      {!!notice && <Text style={s.saved}>{notice}</Text>}
      {tab === 'profile' && premiumActive && <PremiumActiveCard admin={admin} premium={premiumActive} />}
      {tab === 'profile' && <ProfilePanel admin={admin} run={run} flash={setNotice} />}
      {tab === 'discord' && <DiscordPanel admin={admin} run={run} premiumLocked={premiumLocked} unknownError={unknownError} onError={setError} />}
      {tab === 'events' && <EventsPanel admin={admin} run={run} />}
      {tab === 'guides' && <GuidesPanel admin={admin} run={run} />}
      {tab === 'announcements' && <AnnouncementsAdminPanel slug={admin.slug} />}
      {tab === 'stats' && <StatsPanel admin={admin} premiumLocked={premiumLocked} unknownError={unknownError} onError={setError} />}
      {tab === 'insights' && <InsightsPanel admin={admin} run={run} />}
      {tab === 'tools' && <ToolsPanel admin={admin} run={run} />}
      {tab === 'season' && <SeasonPanel admin={admin} unknownError={unknownError} cancelLabel={cancelLabel} run={run} onError={setError} />}
      {tab === 'recruit' && <RecruitPanel admin={admin} run={run} />}
    </ScrollView>
  );
}

/* ---------- shared atoms ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}
function TInput(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput {...props} style={[s.input, props.style]} placeholderTextColor={theme.muted} />;
}
function SaveBtn({ label, savedLabel, onSave }: { label: string; savedLabel: string; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <Pressable
      style={s.saveBtn}
      onPress={() => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 1600); }}
    >
      <Text style={s.saveBtnText}>{saved ? savedLabel : label}</Text>
    </Pressable>
  );
}
function ConfirmBtn({ label, confirmLabel, onConfirm, small }: {
  label: string; confirmLabel: string; onConfirm: () => void; small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <Pressable
      style={[s.dangerBtn, small && s.dangerBtnSmall]}
      onPress={() => { if (armed) { setArmed(false); onConfirm(); } else { setArmed(true); setTimeout(() => setArmed(false), 2600); } }}
    >
      <Text style={[s.dangerText, armed && { color: '#ff9c8a' }]}>{armed ? confirmLabel : label}</Text>
    </Pressable>
  );
}
function DeleteWithLabel({ label, onConfirm }: { label?: string | null; onConfirm: () => void }) {
  const confirmLabel = React.useContext(ConfirmCtx);
  return <ConfirmBtn label={label ?? ''} confirmLabel={confirmLabel} onConfirm={onConfirm} />;
}
function Confirmer({ admin, onConfirm, small }: { admin: Text_; onConfirm: () => void; small?: boolean }) {
  const confirmLabel = React.useContext(ConfirmCtx);
  return <ConfirmBtn label={admin.adminDeleteLabel} confirmLabel={confirmLabel} onConfirm={onConfirm} small={small} />;
}

/* ---------- profile + avatar ---------- */

function ProfilePanel({ admin, run, flash }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
  flash: (m: string) => void;
}) {
  const slug = admin.slug;
  const [name, setName] = useState(admin.name ?? '');
  const [announcement, setAnnouncement] = useState(admin.announcement ?? '');
  const [slogan, setSlogan] = useState(admin.slogan ?? '');
  const [masterName, setMasterName] = useState(admin.masterName ?? '');
  const [logoUrl, setLogoUrl] = useState(admin.logoUrl ?? '');
  const [bgImageUrl, setBgImageUrl] = useState(admin.bgImageUrl ?? '');

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const out = await ImageManipulator.manipulateAsync(
      res.assets[0].uri,
      [{ resize: { width: 512, height: 512 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );
    if (out.base64) run(adminSetAvatar(slug, out.base64));
  };

  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminAvatarLabel}</Text>
      <View style={s.card}>
        {admin.avatarUrl
          ? <Image source={{ uri: admin.avatarUrl }} style={s.avatarImg} />
          : <Text style={s.muted}>{admin.adminAvatarNoneText}</Text>}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Pressable style={s.ghostBtn} onPress={pickAvatar}>
            <Text style={s.ghostBtnText}>{admin.avatarUrl ? admin.adminReplaceAvatarLabel : admin.adminUploadAvatarLabel}</Text>
          </Pressable>
          {!!admin.avatarUrl && (
            <DeleteWithLabel label={admin.adminDeleteAvatarLabel} onConfirm={() => run(adminDeleteAvatar(slug))} />
          )}
        </View>
      </View>

      <Text style={s.sectionTitle}>{admin.adminProfileTitle}</Text>
      <View style={s.card}>
        <Field label={admin.adminNameLabel}><TInput value={name} onChangeText={setName} /></Field>
        <Field label={admin.adminAnnouncementLabel}><TInput value={announcement} onChangeText={setAnnouncement} multiline /></Field>
        <Field label={admin.adminSloganLabel}><TInput value={slogan} onChangeText={setSlogan} /></Field>
        <Field label={admin.adminMasterLabel}><TInput value={masterName} onChangeText={setMasterName} /></Field>
        <Field label={admin.adminLogoLabel}><TInput value={logoUrl} onChangeText={setLogoUrl} autoCapitalize="none" /></Field>
        <Field label={admin.adminBgLabel}><TInput value={bgImageUrl} onChangeText={setBgImageUrl} autoCapitalize="none" /></Field>
        <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
          onSave={() => { run(adminUpdateProfile(slug, { name, announcement, slogan, masterName, logoUrl, bgImageUrl })); flash(admin.adminSavedText); }} />
      </View>
    </View>
  );
}

/* ---------- discord / features / visibility ---------- */

function fillTemplate(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

function DiscordPanel({ admin, run, premiumLocked, unknownError, onError }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
  premiumLocked: any;
  unknownError: string;
  onError: (m: string) => void;
}) {
  const slug = admin.slug;
  const [webhook, setWebhook] = useState('');
  const [guildId, setGuildId] = useState(admin.discordGuildId ?? '');
  const webhookSet = !!admin.reminderWebhookSet;
  const [offsets, setOffsets] = useState<number[]>(
    Array.isArray(admin.reminderOffsets) ? [...admin.reminderOffsets] : [10],
  );
  const [customText, setCustomText] = useState(admin.reminderCustomText ?? '');
  const [wlHide, setWlHide] = useState(!!admin.whiteLabelHideBranding);
  const [wlAccent, setWlAccent] = useState(admin.ogAccent ?? '');
  const [wlSuffix, setWlSuffix] = useState(admin.ogTitleSuffix ?? '');
  const [cdHostname, setCdHostname] = useState('');
  const cd = admin.customDomain ?? null;
  const cdLocked = cd?.__typename === 'GuildAdminCustomDomainLocked' ? cd : null;
  const cdFull = cd?.__typename === 'GuildAdminCustomDomain' ? cd : null;
  const cdBound = !!cdFull && cdFull.status !== 'NONE';
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminDiscordTitle}</Text>
      <View style={s.card}>
        <Field label={admin.adminWebhookLabel}>
          <TInput value={webhook} onChangeText={setWebhook} autoCapitalize="none"
            placeholder={webhookSet ? (admin.adminWebhookSetText ?? '') : (admin.adminWebhookUnsetText ?? '')} />
        </Field>
        <Text style={s.muted}>{webhookSet ? admin.adminWebhookSetText : admin.adminWebhookUnsetText}</Text>
        <Field label={admin.adminDiscordIdLabel}>
          <TInput value={guildId} onChangeText={setGuildId} autoCapitalize="none" keyboardType="number-pad" />
        </Field>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
            onSave={() => run(adminUpdateDiscord(slug, { webhook: webhook || undefined, discordGuildId: guildId }))} />
          {webhookSet && (
            <DeleteWithLabel label={admin.adminWebhookClearLabel} onConfirm={() => run(adminUpdateDiscord(slug, { webhook: '' }))} />
          )}
        </View>
      </View>

      {premiumLocked ? (
        <PremiumLockedCard premium={premiumLocked} slug={slug} unknownError={unknownError} onError={onError} />
      ) : (<>
      <Text style={s.sectionTitle}>{admin.adminReminderTitle}</Text>
      <View style={s.card}>
        <Field label={admin.adminReminderOffsetsLabel}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[60, 30, 10, 5].map((m) => {
              const on = offsets.includes(m);
              return (
                <Pressable key={m}
                  onPress={() => setOffsets((prev) => on ? prev.filter((x) => x !== m) : [...prev, m])}
                  style={{
                    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1,
                    borderColor: theme.gold, backgroundColor: on ? theme.gold : 'transparent',
                  }}>
                  <Text style={{ color: on ? '#1a1814' : theme.paper, fontSize: 13, fontFamily: fonts.serif }}>
                    {fillTemplate(admin.adminReminderOffsetTemplate ?? '', { minutes: m })}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
        <Field label={admin.adminReminderCustomTextLabel}>
          <TInput value={customText} onChangeText={setCustomText} maxLength={100} />
        </Field>
        <Text style={s.muted}>{admin.adminReminderCustomTextHint}</Text>
        <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
          onSave={() => run(adminUpdateReminderSettings(slug, offsets, customText))} />
      </View>

      </>)}
      <Text style={s.sectionTitle}>{admin.adminVisibilityTitle}</Text>
      <View style={s.card}>
        <View style={s.switchRow}>
          <Text style={s.switchLabel}>{admin.adminVisibilityLabel}</Text>
          <Switch value={!!admin.devOnly}
            onValueChange={(v) => run(adminUpdateVisibility(slug, v))} />
        </View>
      </View>

      {!premiumLocked && (<>
      <Text style={s.sectionTitle}>{admin.adminWhiteLabelTitle}</Text>
      <View style={s.card}>
        <View style={s.switchRow}>
          <Text style={s.switchLabel}>{admin.adminHideBrandingLabel}</Text>
          <Switch value={wlHide} onValueChange={setWlHide} />
        </View>
        <Text style={s.muted}>{admin.adminHideBrandingHint}</Text>
        <Field label={admin.adminOgAccentLabel}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(admin.ogAccentOptions ?? []).map((o) => {
              const on = wlAccent === o.key;
              return (
                <Pressable key={o.key}
                  onPress={() => setWlAccent(on ? '' : o.key)}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 7,
                    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1,
                    borderColor: on ? theme.gold : 'rgba(201,163,92,.3)',
                    backgroundColor: on ? 'rgba(201,163,92,.16)' : 'transparent',
                  }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: o.hex }} />
                  <Text style={{ color: on ? '#ecd28f' : theme.muted, fontSize: 13, fontFamily: fonts.serif }}>{o.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
        <Field label={admin.adminOgTitleSuffixLabel}>
          <TInput value={wlSuffix} onChangeText={setWlSuffix} maxLength={30} />
        </Field>
        <Text style={s.muted}>{admin.adminOgTitleSuffixHint}</Text>
        <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
          onSave={() => run(adminUpdateWhiteLabel(slug, wlHide, wlAccent, wlSuffix))} />
      </View>
      </>)}

      <Text style={s.sectionTitle}>{admin.adminCustomDomainTitle}</Text>
      <View style={s.card}>
        {cdLocked ? (<>
          <Text style={{ color: theme.paper, fontSize: 14, fontFamily: fonts.serif }}>{cdLocked.premiumTitle}</Text>
          <Text style={s.muted}>{cdLocked.premiumBody}</Text>
        </>) : cdFull ? (<>
          <Text style={s.muted}>{admin.adminCustomDomainHint}</Text>
          <Text style={{ color: cdFull.status === 'ACTIVE' ? '#ecd28f' : theme.paper, fontSize: 14, fontFamily: fonts.serif }}>
            {cdFull.statusText}{cdBound && cdFull.hostname ? `  ${cdFull.hostname}` : ''}
          </Text>
          {!!cdFull.boundAtText && <Text style={s.muted}>{cdFull.boundAtText}</Text>}
          {!!cdFull.dnsCnameValue && (<>
            <Text style={{ color: '#ecd28f', fontSize: 13, fontFamily: fonts.serif, marginTop: 6 }}>{admin.adminCustomDomainDnsTitle}</Text>
            <Text style={s.muted}>{admin.adminCustomDomainCnameLabel}</Text>
            <Text style={{ color: theme.paper, fontSize: 13 }}>{`${admin.adminCustomDomainRecordNameLabel}: ${cdFull.dnsCnameName}`}</Text>
            <Text style={{ color: theme.paper, fontSize: 13 }}>{`${admin.adminCustomDomainRecordValueLabel}: ${cdFull.dnsCnameValue}`}</Text>
            <Text style={s.muted}>{admin.adminCustomDomainTxtLabel}</Text>
            <Text style={{ color: theme.paper, fontSize: 13 }}>{`${admin.adminCustomDomainRecordNameLabel}: ${cdFull.dnsTxtName}`}</Text>
            <Text style={{ color: theme.paper, fontSize: 13 }}>{`${admin.adminCustomDomainRecordValueLabel}: ${cdFull.dnsTxtValue}`}</Text>
          </>)}
          {!!cdFull.guidanceText && <Text style={s.muted}>{cdFull.guidanceText}</Text>}
          <Field label={admin.adminCustomDomainHostnameLabel}>
            <TInput value={cdHostname} onChangeText={setCdHostname} autoCapitalize="none"
              placeholder={cdBound && cdFull.hostname ? cdFull.hostname : (admin.adminCustomDomainHostnamePlaceholder ?? '')} />
          </Field>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <SaveBtn label={cdBound ? admin.adminCustomDomainRebindLabel : admin.adminCustomDomainBindLabel}
              savedLabel={admin.adminSavedText}
              onSave={() => { if (cdHostname.trim()) run(adminBindCustomDomain(slug, cdHostname.trim())); }} />
            {cdFull.status === 'PENDING' && (
              <Pressable onPress={() => run(adminVerifyCustomDomain(slug))}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: theme.gold }}>
                <Text style={{ color: '#ecd28f', fontSize: 13, fontFamily: fonts.serif }}>{admin.adminCustomDomainVerifyLabel}</Text>
              </Pressable>
            )}
            {cdBound && (
              <DeleteWithLabel label={admin.adminCustomDomainRemoveLabel} onConfirm={() => run(adminRemoveCustomDomain(slug))} />
            )}
          </View>
        </>) : null}
      </View>
    </View>
  );
}

const SECTS_M = ['鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊', '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风'];

/* ---------- events ---------- */

function fmtLocalInput(epochSec: number | null | undefined): string {
  if (!epochSec) return '';
  const d = new Date(epochSec * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function parseLocalInput(v: string): number | null {
  const m = v.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
}

type AdminEventT = NonNullable<Admin['events']>[number];
const TYPE_KEYS_M = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER'] as const;

function EventForm({ admin, initial, statusEditable, submitLabel, onSubmit }: {
  admin: Admin;
  initial: Partial<AdminEventT>;
  statusEditable?: boolean;
  submitLabel: string;
  onSubmit: (input: any) => void;
}) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [type, setType] = useState<string>(initial.type ?? 'ACTIVITY');
  const [time, setTime] = useState(fmtLocalInput(initial.startsAtUtc));
  const [dungeon, setDungeon] = useState(initial.dungeon ?? '');
  const [maxSlots, setMaxSlots] = useState(initial.maxSlots ? String(initial.maxSlots) : '');
  const [meetInfo, setMeetInfo] = useState(initial.meetInfo ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [status, setStatus] = useState(initial.status === 'closed' ? 'closed' : 'open');
  const typeLabels: Record<string, string> = {
    ACTIVITY: admin.adminTypeActivityText ?? '', TALENT: admin.adminTypeTalentText ?? '',
    RACE: admin.adminTypeRaceText ?? '', TOWER: admin.adminTypeTowerText ?? '',
  };
  return (
    <View>
      <Field label={admin.adminEventTitleLabel}><TInput value={title} onChangeText={setTitle} /></Field>
      <Field label={admin.adminEventTypeLabel}>
        <View style={s.chipWrap}>
          {TYPE_KEYS_M.map((k) => (
            <Pressable key={k} onPress={() => setType(k)} style={[s.chip, type === k && s.chipOn]}>
              <Text style={[s.chipText, type === k && s.chipTextOn]}>{typeLabels[k]}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <Field label={admin.adminEventTimeLabel}>
        <TInput value={time} onChangeText={setTime} placeholder="2026-10-26 20:00" autoCapitalize="none" />
      </Field>
      <Field label={admin.adminEventSlotsLabel}>
        <TInput value={maxSlots} onChangeText={setMaxSlots} keyboardType="number-pad" />
      </Field>
      <Field label={admin.adminEventDungeonLabel}><TInput value={dungeon} onChangeText={setDungeon} /></Field>
      <Field label={admin.adminEventMeetLabel}><TInput value={meetInfo} onChangeText={setMeetInfo} /></Field>
      <Field label={admin.adminEventDescLabel}><TInput value={description} onChangeText={setDescription} multiline /></Field>
      {statusEditable && (
        <Field label={admin.adminEventStatusLabel}>
          <View style={s.chipWrap}>
            {(['open', 'closed'] as const).map((st) => (
              <Pressable key={st} onPress={() => setStatus(st)} style={[s.chip, status === st && s.chipOn]}>
                <Text style={[s.chipText, status === st && s.chipTextOn]}>
                  {st === 'open' ? admin.adminStatusOpenText : admin.adminStatusClosedText}
                </Text>
              </Pressable>
            ))}
          </View>
        </Field>
      )}
      <SaveBtn label={submitLabel} savedLabel={admin.adminSavedText} onSave={() => onSubmit({
        title, type, startsAtUtc: parseLocalInput(time), dungeon,
        maxSlots: maxSlots ? parseInt(maxSlots, 10) : undefined,
        meetInfo, description,
        ...(statusEditable ? { status } : {}),
      })} />
    </View>
  );
}

function EventsPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const events = admin.events ?? [];
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminEventsTitle}</Text>
      {events.length === 0 && <Text style={s.muted}>{admin.adminEventEmptyText}</Text>}
      {events.map((ev) => (
        <EventCard key={ev.id} admin={admin} ev={ev} run={run} />
      ))}
      <View style={s.card}>
        <EventForm admin={admin} initial={{}} submitLabel={admin.adminAddLabel ?? ''}
          onSubmit={(input) => run(adminCreateEvent(slug, input))} />
      </View>
    </View>
  );
}

function EventCard({ admin, ev, run }: {
  admin: Admin; ev: AdminEventT;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [open, setOpen] = useState(false);
  const [rTeam, setRTeam] = useState('');
  const [rMembers, setRMembers] = useState('');
  const [rTime, setRTime] = useState('');
  const [rProof, setRProof] = useState('');
  const [rNote, setRNote] = useState('');
  const statusText = ev.status === 'open' ? admin.adminStatusOpenText
    : ev.status === 'closed' ? admin.adminStatusClosedText
    : ev.status === 'completed' ? admin.adminStatusCompletedText
    : admin.adminStatusDraftText;
  return (
    <View style={s.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Text style={s.eventTitle}>{ev.title}</Text>
        <Text style={s.statusChip}>{statusText}</Text>
        {!!ev.startsAtText && <Text style={s.muted}>{ev.startsAtText}</Text>}
        <Text style={s.muted}>{ev.signupCount}/{ev.maxSlots}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <Pressable style={s.ghostBtn} onPress={() => Share.share({ message: ev.signupsCsv ?? '' })}>
          <Text style={s.ghostBtnText}>{admin.adminExportCsvLabel}</Text>
        </Pressable>
        <Pressable style={s.ghostBtn} onPress={() => setOpen(!open)}>
          <Text style={s.ghostBtnText}>{admin.adminEditLabel}</Text>
        </Pressable>
        <Confirmer admin={admin} onConfirm={() => run(adminDeleteEvent(slug, ev.id))} />
      </View>
      {open && (
        <View style={{ marginTop: 12 }}>
          <EventForm admin={admin} initial={ev} statusEditable submitLabel={admin.adminSaveLabel ?? ''}
            onSubmit={(input) => run(adminUpdateEvent(slug, ev.id, input))} />
          <Text style={s.sectionTitle}>{admin.adminSignupsTitle} ({(ev.signups ?? []).length})</Text>
          {(ev.signups ?? []).length === 0 && <Text style={s.muted}>{admin.adminSignupEmptyText}</Text>}
          {(ev.signups ?? []).map((sg) => (
            <View key={sg.id} style={s.memberRow}>
              <Text style={s.memberName}>{sg.nickname}</Text>
              <Text style={s.muted}>{sg.weapon}</Text>
              <Text style={s.muted}>{sg.role}</Text>
              <Pressable onPress={() => run(adminRemoveSignup(slug, sg.id))} hitSlop={6}>
                <Text style={s.dangerInline}>{admin.adminRemoveSignupLabel}</Text>
              </Pressable>
            </View>
          ))}
          <Text style={s.sectionTitle}>{admin.adminResultsTitle}</Text>
          {(ev.results ?? []).map((r) => (
            <View key={r.id} style={s.memberRow}>
              <Text style={s.memberName}>{r.teamName}</Text>
              <Text style={{ color: '#ecd28f', fontFamily: fonts.serif, fontSize: 13 }}>{r.timeText}</Text>
              <Text style={s.muted}>{r.members}</Text>
              <Confirmer admin={admin} small onConfirm={() => run(adminDeleteResult(slug, r.id))} />
            </View>
          ))}
          <Field label={admin.adminResultTeamLabel}><TInput value={rTeam} onChangeText={setRTeam} /></Field>
          <Field label={admin.adminResultMembersLabel}><TInput value={rMembers} onChangeText={setRMembers} /></Field>
          <Field label={admin.adminResultTimeLabel}><TInput value={rTime} onChangeText={setRTime} placeholder="12:34.56" autoCapitalize="none" /></Field>
          <Field label={admin.adminResultProofLabel}><TInput value={rProof} onChangeText={setRProof} autoCapitalize="none" /></Field>
          <Field label={admin.adminResultNoteLabel}><TInput value={rNote} onChangeText={setRNote} /></Field>
          <SaveBtn label={admin.adminAddLabel ?? ''} savedLabel={admin.adminSavedText}
            onSave={() => {
              run(adminAddResult(slug, ev.id, { teamName: rTeam, members: rMembers, timeText: rTime, proofUrl: rProof, note: rNote }));
              setRTeam(''); setRMembers(''); setRTime(''); setRProof(''); setRNote('');
            }} />
        </View>
      )}
    </View>
  );
}

/* ---------- school guides ---------- */

function GuidesPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const schools = admin.schoolGuides?.schools ?? [];
  const [school, setSchool] = useState(SECTS_M[0]);
  const [build, setBuild] = useState('');
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminGuidesTitle}</Text>
      <Text style={s.muted}>{admin.adminGuidesHint}</Text>
      {schools.map((g) => (
        <View key={g.school} style={s.card}>
          <Text style={s.eventTitle}>{g.school}</Text>
          {(g.builds ?? []).map((b) => (
            <BuildEditor key={b.build} admin={admin} school={g.school} build={b} run={run} />
          ))}
          <RotationEditor admin={admin} school={g.school} rotationJson={g.rotationJson ?? ''} run={run} />
        </View>
      ))}
      <View style={s.card}>
        <Field label={admin.adminGuideSchoolLabel}>
          <View style={s.chipWrap}>
            {SECTS_M.map((w) => (
              <Pressable key={w} onPress={() => setSchool(w)} style={[s.chip, school === w && s.chipOn]}>
                <Text style={[s.chipText, school === w && s.chipTextOn]}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </Field>
        <Field label={admin.adminGuideBuildLabel}><TInput value={build} onChangeText={setBuild} /></Field>
        <SaveBtn label={admin.adminAddLabel ?? ''} savedLabel={admin.adminSavedText}
          onSave={() => { run(adminUpdateGuide(slug, { school, build, attr: '', rate: '', bisJson: '', rotationJson: '' })); setBuild(''); }} />
      </View>
    </View>
  );
}

function BuildEditor({ admin, school, build, run }: {
  admin: Admin; school: string;
  build: { build: string; attr?: string | null; rate?: string | null; bisJson?: string | null };
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [name, setName] = useState(build.build);
  const [attr, setAttr] = useState(build.attr ?? '');
  const [rate, setRate] = useState(build.rate ?? '');
  const [bisJson, setBisJson] = useState(build.bisJson ?? '');
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.15)', marginTop: 10, paddingTop: 10 }}>
      <Field label={admin.adminGuideBuildLabel}><TInput value={name} onChangeText={setName} /></Field>
      <Field label={admin.adminGuideAttrLabel}><TInput value={attr} onChangeText={setAttr} /></Field>
      <Field label={admin.adminGuideRateLabel}><TInput value={rate} onChangeText={setRate} /></Field>
      <Field label={admin.adminGuideBisLabel}>
        <TInput value={bisJson} onChangeText={setBisJson} multiline autoCapitalize="none"
          style={{ minHeight: 64, fontSize: 12 }} />
      </Field>
      <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
        onSave={() => run(adminUpdateGuide(slug, { school, build: name, attr, rate, bisJson }))} />
    </View>
  );
}

function RotationEditor({ admin, school, rotationJson, run }: {
  admin: Admin; school: string; rotationJson: string;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [json, setJson] = useState(rotationJson);
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.15)', marginTop: 10, paddingTop: 10 }}>
      <Field label={admin.adminGuideRotationLabel}>
        <TInput value={json} onChangeText={setJson} multiline autoCapitalize="none"
          style={{ minHeight: 64, fontSize: 12 }} />
      </Field>
      <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
        onSave={() => run(adminUpdateGuide(slug, { school, rotationJson: json }))} />
    </View>
  );
}

/* ---------- premium (locked / active, server-composed variants) ---------- */

function PremiumLockedCard({ premium, slug, unknownError, onError }: {
  premium: any;
  slug: string;
  unknownError: string;
  onError: (m: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <View>
      <Text style={s.sectionTitle}>{premium.premiumTitle}</Text>
      <View style={s.card}>
        <Text style={{ color: theme.paper, fontSize: 14, lineHeight: 21, fontFamily: fonts.serif }}>{premium.premiumBody}</Text>
        {!!premium.premiumPriceLabel && (
          <Text style={{ color: '#ecd28f', fontSize: 22, marginTop: 12, fontFamily: fonts.serif }}>{premium.premiumPriceLabel}</Text>
        )}
        {/* Tier pricing arrives composed from the backend (names +
            prices); the card renders what it is given. */}
        {(premium.premiumTierPlans || []).map((plan: any) => (
          <View key={plan.tier} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text style={{ color: theme.paper, fontSize: 14, fontFamily: fonts.serif }}>
              {plan.name}
              <Text style={{ color: theme.muted, fontSize: 12 }}> · {plan.subtitle}</Text>
            </Text>
            <Text style={{ color: '#ecd28f', fontSize: 15, fontFamily: fonts.serif }}>{plan.priceLabel}</Text>
          </View>
        ))}
        {premium.premiumComingSoonText ? (
          <Text style={[s.muted, { marginTop: 12 }]}>{premium.premiumComingSoonText}</Text>
        ) : (
          <Pressable
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                const r = await adminStartPremiumCheckout(slug);
                if (r.ok && r.checkoutUrl) await Linking.openURL(r.checkoutUrl);
                else onError(r.error || unknownError);
              } catch { onError(unknownError); }
              setBusy(false);
            }}
            style={{ marginTop: 14, alignSelf: 'flex-start', backgroundColor: theme.gold, borderRadius: 8, paddingVertical: 9, paddingHorizontal: 22 }}>
            <Text style={{ color: '#1a1814', fontSize: 14, fontFamily: fonts.serif }}>{premium.premiumCheckoutLabel}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PremiumActiveCard({ admin, premium }: { admin: Admin; premium: any }) {
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminPremiumTitle}</Text>
      <View style={s.card}>
        <Text style={{ color: theme.paper, fontSize: 14, fontFamily: fonts.serif }}>
          {premium.premiumPlanLabel} · {premium.premiumSourceText}
        </Text>
        {!!premium.premiumPeriodEndText && (
          <Text style={[s.muted, { marginTop: 6 }]}>{premium.premiumPeriodEndText}</Text>
        )}
        {!!premium.premiumPastDueText && (
          <Text style={{ color: '#e8a13a', fontSize: 13, marginTop: 6 }}>{premium.premiumPastDueText}</Text>
        )}
      </View>
    </View>
  );
}

/* ---------- season (pre-season checklist + roster OCR, isomorphic with Web) ---------- */

type RosterPreview = NonNullable<RosterImportPayload['preview']>;

function SeasonPanel({ admin, unknownError, cancelLabel, run, onError }: {
  admin: Admin;
  unknownError: string;
  cancelLabel: string;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
  onError: (m: string) => void;
}) {
  const slug = admin.slug;
  const confirmLabel = React.useContext(ConfirmCtx);
  const checklist: any = (admin as any).seasonChecklist ?? null;
  const roster: any = (admin as any).roster ?? null;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<RosterPreview | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const upload = async () => {
    const files = await pickImageFiles(true).catch(() => null);
    if (!files || files.length === 0) return;
    setBusy(true); setNotice('');
    try {
      // Same recognition path as the gear OCR: a pluggable session over
      // the prepared + enhanced passes; only text lines leave the
      // device. Where no engine exists (native, pre-ML-Kit) the session
      // factory throws and the generic error surfaces — no fake lines.
      const session = await activeRecognizer().createSession();
      const seen = new Set<string>();
      const lines: string[] = [];
      try {
        for (const f of files) {
          for (const pass of [{ blob: await ocrPrepare(f), psm6: false }, { blob: await ocrEnhance(f), psm6: true }]) {
            const data = await session.recognize(pass.blob, { psm6: pass.psm6 });
            for (const raw of String(data?.text ?? '').split(/\r?\n/)) {
              const line = raw.trim();
              if (line && !seen.has(line)) { seen.add(line); lines.push(line); }
            }
          }
        }
      } finally { await session.terminate().catch(() => undefined); }
      const res = await adminPreviewRosterImport(slug, lines, files.length);
      if (!res.ok) { onError(res.error || unknownError); return; }
      const p = res.preview ?? null;
      setPreview(p);
      setSelected(new Set((p?.rows ?? []).filter((r) => r.importable).map((r) => r.id)));
    } catch { onError(unknownError); } finally { setBusy(false); }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      const res = await adminConfirmRosterImport(slug, preview.batchId, [...selected]);
      if (!res.ok) { onError(res.error || unknownError); return; }
      setNotice(res.message ?? '');
      setPreview(null);
      run(Promise.resolve({ ok: true }));
    } catch { onError(unknownError); } finally { setBusy(false); }
  };

  return (
    <View>
      {!!checklist && (
        <View>
          <Text style={s.sectionTitle}>{checklist.title}</Text>
          <Text style={s.muted}>{checklist.versionLabel}</Text>
          {!!checklist.seasonLabel && <Text style={s.muted}>{checklist.seasonLabel}</Text>}
          <Text style={s.muted}>{checklist.hint}</Text>
          <Text style={[s.muted, { marginTop: 6 }]}>
            {fill(checklist.progressTemplate ?? '', { done: checklist.doneCount ?? 0, total: checklist.totalCount ?? 0 })}
          </Text>
          {(checklist.items ?? []).map((it: any) => (
            <Pressable
              key={it.key}
              style={s.memberRow}
              onPress={() => run(adminSetSeasonChecklistItem(slug, it.key, !it.checked))}
            >
              <Text style={s.eventTitle}>{it.checked ? '☑' : '☐'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.eventTitle}>{it.title}</Text>
                <Text style={s.muted}>{it.detail}</Text>
                {!!it.checkedByName && <Text style={s.muted}>{it.checkedByName}</Text>}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {!!roster && (
        <View>
          <Text style={s.sectionTitle}>{roster.rosterTitle}</Text>
          <Text style={s.muted}>{roster.rosterHint}</Text>
          {(roster.entries ?? []).length === 0
            ? <Text style={[s.muted, { marginTop: 8 }]}>{roster.rosterEmptyText}</Text>
            : (roster.entries ?? []).map((e: any) => (
              <View key={e.id} style={s.memberRow}>
                <Text style={s.memberName}>{e.displayName}</Text>
                <Text style={s.roleChip}>{e.source === 'ocr' ? roster.rosterSourceOcrLabel : e.source}</Text>
                {!!e.matchedName && <Text style={s.muted}>{roster.rosterMatchedMemberLabel}{e.matchedName}</Text>}
                <View style={{ flex: 1 }} />
                <ConfirmBtn label={roster.rosterDeleteLabel} confirmLabel={confirmLabel}
                  onConfirm={() => run(adminDeleteRosterEntry(slug, e.id))} small />
              </View>
            ))}
          <Pressable style={[s.saveBtn, { marginTop: 12 }]} disabled={busy} onPress={() => void upload()}>
            <Text style={s.saveBtnText}>{busy ? roster.rosterOcrRunningText : roster.rosterUploadLabel}</Text>
          </Pressable>
          {!!notice && <Text style={[s.saved, { marginTop: 8 }]}>{notice}</Text>}
          {!!preview && (
            <View style={s.card}>
              <Text style={s.eventTitle}>{roster.rosterPreviewTitle}</Text>
              {preview.rows.map((r) => (
                <Pressable
                  key={r.id}
                  style={s.memberRow}
                  disabled={!r.importable}
                  onPress={() => setSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                    return next;
                  })}
                >
                  <Text style={s.eventTitle}>{r.importable ? (selected.has(r.id) ? '☑' : '☐') : '·'}</Text>
                  <Text style={s.memberName}>{r.rawName}</Text>
                  <Text style={s.roleChip}>{r.statusLabel}</Text>
                  {!!r.matchedName && <Text style={s.muted}>{r.matchedName}</Text>}
                </Pressable>
              ))}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Pressable style={s.saveBtn} disabled={busy} onPress={() => void confirmImport()}>
                  <Text style={s.saveBtnText}>{roster.rosterConfirmLabel}</Text>
                </Pressable>
                <Pressable style={s.ghostBtn} onPress={() => setPreview(null)}>
                  <Text style={s.ghostBtnText}>{cancelLabel}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ---------- stats (attendance / activity, isomorphic with Web) ---------- */

function StatBar({ ratio }: { ratio: number }) {
  const w = Math.max(0, Math.min(100, ratio * 100));
  return (
    <View style={s.statBarTrack}>
      <View style={[s.statBarFill, { width: `${w}%` }]} />
    </View>
  );
}

function StatMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statMetric}>
      <Text style={s.statMetricLabel}>{label}</Text>
      <Text style={s.statMetricValue}>{value}</Text>
    </View>
  );
}

function StatBoard({ title, unitLabel, emptyText, rows }: {
  title: string;
  unitLabel: string;
  emptyText: string;
  rows: { discordId: string; displayName: string; count: number }[];
}) {
  const top = rows.length ? rows[0].count : 0;
  return (
    <View>
      <View style={s.statBoardHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {rows.length > 0 && <Text style={s.statUnit}>{unitLabel}</Text>}
      </View>
      {rows.length === 0 ? (
        <Text style={s.muted}>{emptyText}</Text>
      ) : rows.map((row, i) => (
        <View key={row.discordId} style={[s.statRow, i > 0 && s.statRowDiv]}>
          <Text style={s.statRank}>{i + 1}</Text>
          <Text style={s.statName}>{row.displayName}</Text>
          <StatBar ratio={top ? row.count / top : 0} />
          <Text style={s.statCount}>{row.count}</Text>
        </View>
      ))}
    </View>
  );
}

function StatsPanel({ admin, premiumLocked, unknownError, onError }: {
  admin: Admin;
  premiumLocked: any;
  unknownError: string;
  onError: (m: string) => void;
}) {
  const statsResult: any = (admin as any).stats ?? null;
  if (statsResult?.__typename !== 'GuildAdminStats') {
    return premiumLocked
      ? <PremiumLockedCard premium={premiumLocked} slug={admin.slug} unknownError={unknownError} onError={onError} />
      : <View />;
  }
  const stats = statsResult;
  const weeks = stats?.weeks ?? [];
  const allEmpty = weeks.every((w: any) => w.carsTotal === 0);
  const typeLine = (w: any) => [
    [admin.adminTypeActivityText, w.carsActivity],
    [admin.adminTypeTalentText, w.carsTalent],
    [admin.adminTypeRaceText, w.carsRace],
    [admin.adminTypeTowerText, w.carsTower],
  ].filter(([, n]) => (n as number) > 0).map(([label, n]) => `${label} ${n}`).join(' · ');
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminStatsTitle}</Text>
      {allEmpty ? (
        <Text style={s.muted}>{admin.adminStatsEmptyText}</Text>
      ) : weeks.map((w: any, i: number) => (
        <View key={w.weekLabel + i} style={s.card}>
          <View style={s.statWeekHead}>
            <Text style={s.eventTitle}>{w.weekLabel}</Text>
            {w.isCurrent && (
              <View style={s.statChip}>
                <Text style={s.statChipText}>{admin.adminStatsCurrentWeekLabel}</Text>
              </View>
            )}
          </View>
          <View style={s.statMetrics}>
            <StatMetric label={admin.adminStatsCarsLabel} value={String(w.carsTotal)} />
            <StatMetric label={admin.adminStatsCompletedLabel} value={String(w.completedCount)} />
            <StatMetric label={admin.adminStatsSeatsLabel} value={`${w.filledSeats}/${w.totalSeats}`} />
            <StatMetric label={admin.adminStatsParticipantsLabel} value={String(w.participantCount)} />
            <StatMetric label={admin.adminStatsPerCapitaLabel} value={String(Math.round(w.perCapita * 100) / 100)} />
          </View>
          <View style={s.statFillRow}>
            <Text style={s.statMetricLabel}>{admin.adminStatsFillRateLabel}</Text>
            <StatBar ratio={w.fillRate} />
            <Text style={s.statCount}>{`${Math.round(w.fillRate * 100)}%`}</Text>
          </View>
          {!!typeLine(w) && <Text style={[s.muted, { marginTop: 8 }]}>{typeLine(w)}</Text>}
        </View>
      ))}
      <StatBoard
        title={admin.adminStatsMembersTitle}
        unitLabel={admin.adminStatsSeatCountLabel}
        emptyText={admin.adminStatsBoardEmptyText}
        rows={(stats?.memberLeaders ?? []).map((m: any) => ({ discordId: m.discordId, displayName: m.displayName, count: m.seatCount }))}
      />
      <StatBoard
        title={admin.adminStatsLeadersTitle}
        unitLabel={admin.adminStatsCarCountLabel}
        emptyText={admin.adminStatsBoardEmptyText}
        rows={(stats?.leaderLeaders ?? []).map((m: any) => ({ discordId: m.discordId, displayName: m.displayName, count: m.carCount }))}
      />
    </View>
  );
}

/* ---------- insights (P2 / P9 / P10 / P15, isomorphic with Web) ----------
 * The tier verdict is the response type of each field: anything but
 * the full variant renders the locked card from the Locked variant's
 * own copy (the premium field is a separate, paygate-era surface and
 * is not consulted here). The heatmap renders the same weekday x
 * hour data as Web, simplified to labeled mini-cells. */

function InsightsPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const a: any = admin as any;
  const [label, setLabel] = useState('');
  const [minScore, setMinScore] = useState('80');
  const reliability = a.reliability ?? null;
  if (reliability?.__typename !== 'GuildAdminReliability') {
    return (
      <View style={s.card}>
        <Text style={s.sectionTitle}>{reliability?.premiumTitle ?? ''}</Text>
        <Text style={[s.muted, { fontSize: 13.5, lineHeight: 21 }]}>{reliability?.premiumBody ?? ''}</Text>
      </View>
    );
  }
  const heat = a.participationHeatmap?.__typename === 'GuildAdminParticipationHeatmap' ? a.participationHeatmap : null;
  const gear = a.gearBoard?.__typename === 'GuildAdminGearBoard' ? a.gearBoard : null;
  const race = a.raceSeasonBoard?.__typename === 'RaceSeasonBoard' ? a.raceSeasonBoard : null;
  const heatByKey = new Map<string, number>(
    (heat?.cells ?? []).map((c: any) => [`${c.weekday}:${c.hour}`, Number(c.count) || 0] as [string, number]),
  );
  const peak = Math.max(1, heat?.peakCount ?? 1);
  return (
    <View>
      <Text style={s.sectionTitle}>{a.adminInsightsReliabilityTitle}</Text>
      <Text style={s.muted}>{a.adminInsightsReliabilityHint}</Text>
      {(reliability.entries ?? []).length === 0 ? (
        <Text style={s.muted}>{a.adminInsightsReliabilityEmptyText}</Text>
      ) : (reliability.entries ?? []).map((e: any, i: number) => (
        <View key={e.discordId} style={[s.statRow, i > 0 && s.statRowDiv]}>
          <Text style={[s.statName, { flex: 1 }]} numberOfLines={1}>{e.displayName}</Text>
          <Text style={s.muted}>{a.adminInsightsSignupsLabel} {e.signupCount}</Text>
          <Text style={s.muted}>{a.adminInsightsAttendedLabel} {e.attendedCount}</Text>
          <Text style={[s.muted, e.noShowCount > 0 && { color: '#e08a7a' }]}>{a.adminInsightsNoShowLabel} {e.noShowCount}</Text>
          <Text style={s.statCount}>{e.settledCount ? `${Math.round(e.attendanceRate * 100)}%` : '—'}</Text>
        </View>
      ))}

      {!!heat && (
        <>
          <Text style={s.sectionTitle}>{a.adminInsightsHeatmapTitle}</Text>
          <Text style={s.muted}>{a.adminInsightsHeatmapHint}</Text>
          <Text style={[s.muted, { marginVertical: 6 }]}>{heat.totalText}</Text>
          {(heat.cells ?? []).length === 0 ? (
            <Text style={s.muted}>{a.adminInsightsHeatmapEmptyText}</Text>
          ) : [0, 1, 2, 3, 4, 5, 6].map((weekday) => (
            <View key={weekday} style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 }}>
              <Text style={[s.muted, { width: 30, fontSize: 10.5 }]}>{(heat.weekdayLabels ?? [])[weekday] ?? ''}</Text>
              {Array.from({ length: 24 }, (_, hour) => {
                const count: number = heatByKey.get(`${weekday}:${hour}`) ?? 0;
                return (
                  <View key={hour} style={{
                    flex: 1, height: 13, borderRadius: 2,
                    backgroundColor: count ? `rgba(201,163,92,${0.15 + (count / peak) * 0.85})` : 'rgba(236,226,203,.05)',
                  }} />
                );
              })}
            </View>
          ))}
        </>
      )}

      {!!gear && (
        <>
          <Text style={s.sectionTitle}>{a.adminInsightsGearTitle}</Text>
          <Text style={s.muted}>{a.adminInsightsGearHint}</Text>
          {(gear.standards ?? []).length === 0 ? (
            <Text style={[s.muted, { marginTop: 6 }]}>{a.adminInsightsGearEmptyText}</Text>
          ) : (gear.standards ?? []).map((std: any) => (
            <View key={std.id} style={s.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.statName, { flex: 1 }]} numberOfLines={1}>{std.label}</Text>
                <Text style={s.statCount}>{std.minScore}</Text>
                <Pressable onPress={() => run(adminDeleteGearStandard(admin.slug, std.id))} hitSlop={6}>
                  <Text style={s.dangerInline}>{a.adminDeleteLabel}</Text>
                </Pressable>
              </View>
              <Text style={[s.muted, { marginVertical: 4 }]}>{std.summaryText}</Text>
              {(std.members ?? []).filter((m: any) => !m.met).map((m: any) => (
                <View key={m.discordId} style={s.statRow}>
                  <Text style={[s.statName, { flex: 1 }]} numberOfLines={1}>{m.displayName}</Text>
                  <Text style={[s.muted, { color: '#e08a7a' }]}>{m.statusText}</Text>
                  <Text style={s.muted}>{a.adminInsightsGearScoreLabel} {m.hasBuild ? m.bestScore : '—'}</Text>
                  <Text style={s.muted}>{a.adminInsightsGearGapLabel} {m.gap}</Text>
                </View>
              ))}
              {(std.members ?? []).filter((m: any) => m.met).map((m: any) => (
                <View key={m.discordId} style={s.statRow}>
                  <Text style={[s.statName, { flex: 1 }]} numberOfLines={1}>{m.displayName}</Text>
                  <Text style={[s.muted, { color: '#9dc08b' }]}>{m.statusText}</Text>
                  <Text style={s.muted}>{a.adminInsightsGearScoreLabel} {m.bestScore}</Text>
                </View>
              ))}
            </View>
          ))}
          <Field label={a.adminInsightsGearLabelLabel}>
            <TInput value={label} onChangeText={setLabel} maxLength={40} />
          </Field>
          <Field label={a.adminInsightsGearMinScoreLabel}>
            <TInput value={minScore} onChangeText={(t) => setMinScore(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
          </Field>
          <Pressable
            style={s.saveBtn}
            onPress={() => {
              const score = Number(minScore);
              if (!label.trim() || !Number.isFinite(score)) return;
              run(adminUpsertGearStandard(admin.slug, null, label.trim(), score), () => setLabel(''));
            }}
          >
            <Text style={s.saveBtnText}>{a.adminInsightsGearAddLabel}</Text>
          </Pressable>
        </>
      )}

      {!!race && (
        <>
          <Text style={s.sectionTitle}>{a.adminInsightsRaceTitle}</Text>
          {(race.seasons ?? []).length === 0 ? (
            <Text style={s.muted}>{a.adminInsightsRaceEmptyText}</Text>
          ) : (race.seasons ?? []).map((season: any) => (
            <View key={season.season || 'none'}>
              <Text style={[s.muted, { color: theme.goldHi, marginTop: 6 }]}>{season.seasonLabel}</Text>
              {(season.entries ?? []).map((e: any, i: number) => (
                <View key={e.teamName} style={[s.statRow, i > 0 && s.statRowDiv]}>
                  <Text style={s.statRank}>{i + 1}</Text>
                  <Text style={[s.statName, { flex: 1 }]} numberOfLines={1}>{e.teamName}</Text>
                  <Text style={s.muted}>{a.adminInsightsRaceRunsLabel} {e.runCount}</Text>
                  <Text style={s.muted}>{a.adminInsightsRaceWinsLabel} {e.winCount}</Text>
                  <Text style={[s.statCount, { width: 64 }]}>{e.bestTimeText}</Text>
                </View>
              ))}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

/* ---------- activity tools (lottery, isomorphic with Web) ---------- */

function ToolEntryChips({ entries, gold }: { entries: readonly any[]; gold?: boolean }) {
  return (
    <View style={s.chipWrap}>
      {entries.map((e: any) => (
        <Text key={e.discordId} style={[s.roleChip, gold && s.roleChipHeal]}>{e.displayName} · {e.weight}</Text>
      ))}
    </View>
  );
}

function ToolsPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const confirmLabel = React.useContext(ConfirmCtx);
  const lotteries: readonly any[] = (admin as any).lotteries ?? [];
  const roster: readonly any[] = (admin as any).lotteryRoster ?? [];
  const events: readonly any[] = (admin as any).events ?? [];
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const [source, setSource] = useState<'GROUPING' | 'MEMBERS'>('GROUPING');
  const [sourceEventId, setSourceEventId] = useState('');
  const [uniformWeight, setUniformWeight] = useState('1');
  const [winnerCount, setWinnerCount] = useState('1');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const toggleMember = (discordId: string) => {
    setPicked((prev) => {
      const next = { ...prev };
      if (discordId in next) delete next[discordId];
      else next[discordId] = '1';
      return next;
    });
  };
  const submitCreate = () => {
    const wc = parseInt(winnerCount, 10) || 0;
    if (source === 'GROUPING') {
      run(adminCreateLottery(slug, {
        title, prize: prize || undefined, source,
        sourceEventId: sourceEventId || undefined,
        uniformWeight: parseInt(uniformWeight, 10) || 1,
        winnerCount: wc,
      }));
    } else {
      run(adminCreateLottery(slug, {
        title, prize: prize || undefined, source, winnerCount: wc,
        entries: Object.entries(picked).map(([discordId, w]) => ({
          discordId, weight: parseInt(w, 10) || 1,
        })),
      }));
    }
  };
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminLotteryTitle}</Text>
      <Text style={[s.muted, { marginBottom: 12 }]}>{admin.adminLotteryHint}</Text>
      <Field label={admin.adminLotteryNameLabel}>
        <TInput value={title} maxLength={60} onChangeText={setTitle} />
      </Field>
      <Field label={admin.adminLotteryPrizeLabel}>
        <TInput value={prize} maxLength={200} onChangeText={setPrize} />
      </Field>
      <Field label={admin.adminLotterySourceLabel}>
        <View style={s.chipWrap}>
          <Pressable style={[s.chip, source === 'GROUPING' && s.chipOn]} onPress={() => setSource('GROUPING')}>
            <Text style={[s.chipText, source === 'GROUPING' && s.chipTextOn]}>{admin.adminLotterySourceGroupingText}</Text>
          </Pressable>
          <Pressable style={[s.chip, source === 'MEMBERS' && s.chipOn]} onPress={() => setSource('MEMBERS')}>
            <Text style={[s.chipText, source === 'MEMBERS' && s.chipTextOn]}>{admin.adminLotterySourceMembersText}</Text>
          </Pressable>
        </View>
      </Field>
      {source === 'GROUPING' ? (
        <>
          <Field label={admin.adminLotteryGroupingLabel}>
            <View style={s.chipWrap}>
              {events.map((ev: any) => (
                <Pressable key={ev.id} style={[s.chip, sourceEventId === ev.id && s.chipOn]} onPress={() => setSourceEventId(ev.id)}>
                  <Text style={[s.chipText, sourceEventId === ev.id && s.chipTextOn]}>{ev.title}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
          <Field label={admin.adminLotteryUniformWeightLabel}>
            <TInput value={uniformWeight} keyboardType="number-pad" onChangeText={setUniformWeight} />
          </Field>
        </>
      ) : (
        <Field label={admin.adminLotteryEntriesLabel}>
          <View>
            {roster.map((m: any) => (
              <View key={m.discordId} style={s.memberRow}>
                <Pressable style={[s.chip, m.discordId in picked && s.chipOn]} onPress={() => toggleMember(m.discordId)}>
                  <Text style={[s.chipText, m.discordId in picked && s.chipTextOn]}>{m.displayName}</Text>
                </Pressable>
                {m.discordId in picked && (
                  <>
                    <Text style={s.muted}>{admin.adminLotteryWeightLabel}</Text>
                    <TInput
                      style={{ width: 76, paddingVertical: 5 }}
                      value={picked[m.discordId]}
                      keyboardType="number-pad"
                      onChangeText={(v) => setPicked((prev) => ({ ...prev, [m.discordId]: v }))}
                    />
                  </>
                )}
              </View>
            ))}
          </View>
        </Field>
      )}
      <Field label={admin.adminLotteryWinnerCountLabel}>
        <TInput value={winnerCount} keyboardType="number-pad" onChangeText={setWinnerCount} />
      </Field>
      <SaveBtn label={admin.adminLotteryCreateLabel} savedLabel={admin.adminSavedText} onSave={submitCreate} />

      {lotteries.length === 0 ? (
        <Text style={[s.muted, { marginTop: 16 }]}>{admin.adminLotteryEmptyText}</Text>
      ) : lotteries.map((lot: any) => (
        <View key={lot.id} style={[s.card, { marginTop: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <Text style={s.eventTitle}>{lot.title}</Text>
            <Text style={s.statusChip}>
              {lot.status === 'DRAWN' ? admin.adminLotteryStatusDrawnText : admin.adminLotteryStatusOpenText}
            </Text>
            <Text style={s.muted}>{lot.entryCountText}</Text>
            <Text style={s.muted}>{lot.createdAtText}</Text>
            {!!lot.drawnAtText && <Text style={s.muted}>{lot.drawnAtText}</Text>}
          </View>
          {!!lot.prize && <Text style={s.memberName}>{admin.adminLotteryPrizeLabel}: {lot.prize}</Text>}
          {!!lot.sourceEventTitle && (
            <Text style={s.muted}>{admin.adminLotterySourceGroupingText}: {lot.sourceEventTitle}</Text>
          )}
          <Text style={[s.label, { marginTop: 8 }]}>{admin.adminLotteryEntriesLabel}</Text>
          <ToolEntryChips entries={lot.entries} />
          {lot.status === 'DRAWN' && (
            <>
              <Text style={[s.label, { marginTop: 10 }]}>{admin.adminLotteryWinnersLabel}</Text>
              <ToolEntryChips entries={lot.winners} gold />
            </>
          )}
          {lot.status !== 'DRAWN' && (
            <View style={{ marginTop: 10 }}>
              <ConfirmBtn label={admin.adminLotteryDrawLabel} confirmLabel={confirmLabel}
                onConfirm={() => run(adminDrawLottery(slug, lot.id))} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

/* ---------- recruit (F16 applications + F17 mentors + F24 overview, isomorphic with Web) ---------- */

function CheckDot({ done }: { done: boolean }) {
  return (
    <View style={{
      width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: done ? theme.gold : 'rgba(201,163,92,.3)',
      backgroundColor: done ? 'rgba(201,163,92,.16)' : 'transparent',
    }}>
      <Text style={{ fontSize: 11, color: done ? theme.goldHi : theme.muted }}>{done ? '✓' : ''}</Text>
    </View>
  );
}

function RecruitPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const a: any = admin as any;
  const confirmLabel = React.useContext(ConfirmCtx);
  const applications: readonly any[] = a.recruitApplications ?? [];
  const pairings: readonly any[] = a.recruitPairings ?? [];
  const roster: readonly any[] = a.recruitRoster ?? [];
  const newcomers: readonly any[] = a.newcomerProgress ?? [];
  const mentors = roster.filter((m: any) => m.isMentor);
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  return (
    <View>
      <View style={[s.card, { marginBottom: 10 }]}>
        <View style={s.switchRow}>
          <Text style={s.switchLabel}>{a.adminRecruitOpenLabel}</Text>
          <Switch value={!!a.recruitOpen}
            onValueChange={(v) => run(adminUpdateRecruitOpen(slug, v))} />
        </View>
        <Text style={s.muted}>{a.adminRecruitOpenHint}</Text>
      </View>

      <Text style={s.sectionTitle}>{a.adminRecruitApplicationsTitle}</Text>
      {applications.length === 0 ? (
        <Text style={s.muted}>{a.adminRecruitApplicationsEmptyText}</Text>
      ) : applications.map((app: any) => (
        <View key={app.id} style={[s.card, { marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={s.memberName}>{app.applicantName}</Text>
            <Text style={s.statusChip}>{app.statusLabel}</Text>
            <Text style={s.muted}>{app.createdAtText}</Text>
            {!!app.reviewedAtText && <Text style={s.muted}>{app.reviewedByName} · {app.reviewedAtText}</Text>}
          </View>
          {!!app.message && <Text style={[s.memberName, { marginTop: 6 }]}>{app.message}</Text>}
          {app.status === 'PENDING' && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <SaveBtn label={a.adminRecruitApproveLabel} savedLabel={a.adminSavedText}
                onSave={() => run(adminReviewGuildApplication(slug, app.id, true))} />
              <ConfirmBtn label={a.adminRecruitRejectLabel} confirmLabel={confirmLabel}
                onConfirm={() => run(adminReviewGuildApplication(slug, app.id, false))} />
            </View>
          )}
        </View>
      ))}

      <Text style={s.sectionTitle}>{a.adminRecruitMentorPoolTitle}</Text>
      {roster.map((m: any) => (
        <View key={m.discordId} style={s.memberRow}>
          <Text style={[s.memberName, { flex: 1 }]}>{m.displayName}</Text>
          {m.isMentor ? (
            <ConfirmBtn small label={a.adminRecruitUnsetMentorLabel} confirmLabel={confirmLabel}
              onConfirm={() => run(adminSetGuildMentor(slug, m.discordId, false))} />
          ) : (
            <Pressable style={s.ghostBtn} onPress={() => run(adminSetGuildMentor(slug, m.discordId, true))}>
              <Text style={s.ghostBtnText}>{a.adminRecruitSetMentorLabel}</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Field label={a.adminRecruitMentorSelectLabel}>
        <View style={s.chipWrap}>
          {mentors.map((m: any) => (
            <Pressable key={m.discordId} style={[s.chip, mentorId === m.discordId && s.chipOn]} onPress={() => setMentorId(m.discordId)}>
              <Text style={[s.chipText, mentorId === m.discordId && s.chipTextOn]}>{m.displayName}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <Field label={a.adminRecruitMenteeSelectLabel}>
        <View style={s.chipWrap}>
          {roster.map((m: any) => (
            <Pressable key={m.discordId} style={[s.chip, menteeId === m.discordId && s.chipOn]} onPress={() => setMenteeId(m.discordId)}>
              <Text style={[s.chipText, menteeId === m.discordId && s.chipTextOn]}>{m.displayName}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <SaveBtn label={a.adminRecruitPairingCreateLabel} savedLabel={a.adminSavedText}
        onSave={() => run(adminCreateMentorPairing(slug, mentorId, menteeId))} />

      <Text style={s.sectionTitle}>{a.adminRecruitPairingsTitle}</Text>
      {pairings.length === 0 ? (
        <Text style={s.muted}>{a.adminRecruitPairingsEmptyText}</Text>
      ) : pairings.map((p: any) => (
        <View key={p.id} style={[s.card, { marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={s.memberName}>{p.mentorName}</Text>
            <Text style={s.muted}>→</Text>
            <Text style={s.memberName}>{p.menteeName}</Text>
            <Text style={s.statusChip}>{p.statusLabel}</Text>
            <Text style={s.muted}>{p.createdAtText}</Text>
            {!!p.endedAtText && <Text style={s.muted}>{p.endedAtText}</Text>}
          </View>
          {p.status === 'ACTIVE' && (
            <View style={{ marginTop: 10 }}>
              <ConfirmBtn small label={a.adminRecruitPairingEndLabel} confirmLabel={confirmLabel}
                onConfirm={() => run(adminEndMentorPairing(slug, p.id))} />
            </View>
          )}
        </View>
      ))}

      <Text style={s.sectionTitle}>{a.adminRecruitNewcomersTitle}</Text>
      {newcomers.length === 0 ? (
        <Text style={s.muted}>{a.adminRecruitNewcomersEmptyText}</Text>
      ) : newcomers.map((n: any) => (
        <View key={n.discordId} style={[s.card, { marginBottom: 10 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Text style={[s.memberName, { flex: 1 }]}>{n.displayName}</Text>
            <Text style={s.muted}>{n.progressText}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckDot done={n.profileDone} /><Text style={s.muted}>{a.adminRecruitProfileLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckDot done={n.mentorDone} /><Text style={s.muted}>{a.adminRecruitMentorLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <CheckDot done={n.firstRunDone} /><Text style={s.muted}>{a.adminRecruitFirstRunLabel}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/* ---------- styles ---------- */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  content: { paddingHorizontal: 18, paddingBottom: 48 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  back: { color: theme.gold, fontSize: 30, lineHeight: 32, width: 22 },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 3 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tab: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(201,163,92,.3)' },
  tabOn: { backgroundColor: 'rgba(201,163,92,.16)', borderColor: theme.gold },
  tabText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13.5 },
  tabTextOn: { color: theme.goldHi },
  statBarTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(236,226,203,.10)', overflow: 'hidden' },
  statBarFill: { height: '100%', backgroundColor: theme.gold, borderRadius: 3 },
  statMetric: { minWidth: 62 },
  statMetricLabel: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11, marginBottom: 2 },
  statMetricValue: { fontFamily: fonts.serif, color: theme.paper, fontSize: 16 },
  statBoardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  statUnit: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  statRowDiv: { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.10)' },
  statRank: { width: 22, fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  statName: { minWidth: 100, fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  statCount: { width: 36, textAlign: 'right', fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  statWeekHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statChip: { borderWidth: 1, borderColor: 'rgba(201,163,92,.5)', borderRadius: 999, paddingVertical: 1, paddingHorizontal: 8 },
  statChipText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 11 },
  statMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statFillRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  sectionTitle: { fontFamily: fonts.brush, color: theme.gold, fontSize: 16, letterSpacing: 2, marginTop: 20, marginBottom: 10 },
  card: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.25)', borderRadius: 12,
    padding: 14, marginBottom: 12, backgroundColor: 'rgba(255,255,255,.02)',
  },
  label: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.3)', borderRadius: 8,
    paddingVertical: 9, paddingHorizontal: 11, color: theme.paper,
    fontFamily: fonts.serif, fontSize: 14, backgroundColor: 'rgba(0,0,0,.25)',
  },
  saveBtn: {
    alignSelf: 'flex-start', backgroundColor: theme.gold, borderRadius: 8,
    paddingVertical: 9, paddingHorizontal: 20, marginTop: 2,
  },
  saveBtnText: { color: '#171207', fontFamily: fonts.serif, fontSize: 14, fontWeight: '600' },
  ghostBtn: {
    alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(201,163,92,.4)',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
  },
  ghostBtnText: { color: theme.muted, fontFamily: fonts.serif, fontSize: 13 },
  dangerBtn: {
    alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(220,90,60,.5)',
    borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14,
  },
  dangerBtnSmall: { paddingVertical: 4, paddingHorizontal: 10 },
  dangerText: { color: '#e0856e', fontFamily: fonts.serif, fontSize: 13 },
  dangerInline: { color: '#e0856e', fontFamily: fonts.serif, fontSize: 12.5 },
  muted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5 },
  saved: { fontFamily: fonts.serif, color: '#7fb069', fontSize: 13, marginBottom: 10 },
  error: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13, marginBottom: 10 },
  avatarImg: { width: 72, height: 72, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(201,163,92,.4)' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchLabel: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14.5, flex: 1, paddingRight: 12 },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap',
    borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.12)', paddingVertical: 7, marginTop: 4,
  },
  memberName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13.5, minWidth: 70 },
  roleChip: {
    fontFamily: fonts.serif, fontSize: 11, color: theme.muted,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', borderRadius: 999,
    paddingVertical: 1, paddingHorizontal: 7, overflow: 'hidden',
  },
  roleChipHeal: { color: '#ecd28f', borderColor: 'rgba(201,163,92,.6)' },
  linkText: { color: theme.gold, fontFamily: fonts.serif, fontSize: 12.5 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(201,163,92,.3)' },
  chipOn: { backgroundColor: 'rgba(201,163,92,.16)', borderColor: theme.gold },
  chipText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5 },
  chipTextOn: { color: theme.goldHi },
  eventTitle: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15 },
  statusChip: {
    fontFamily: fonts.serif, fontSize: 11, color: theme.muted,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 999,
    paddingVertical: 1, paddingHorizontal: 8, overflow: 'hidden',
  },
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  lockTitle: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 20, letterSpacing: 2, textAlign: 'center' },
  lockBody: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' },
});
