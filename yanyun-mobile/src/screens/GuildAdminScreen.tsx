import React, { Suspense, useState } from 'react';
import {
  Image, Pressable, ScrollView, Share, StyleSheet, Switch, Text, TextInput, View,
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
import {
  adminAddMember, adminAddResult, adminCreateEvent, adminCreateTeam, adminDeleteAvatar,
  adminDeleteEvent, adminDeleteMember, adminDeleteResult, adminDeleteTeam, adminRemoveSignup,
  adminSetAvatar, adminUpdateDiscord, adminUpdateEvent, adminUpdateFeatures, adminUpdateGuide,
  adminUpdateMember, adminUpdateProfile, adminUpdateTeam, adminUpdateVisibility,
  type AdminPayload,
} from '../api';
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
      <AdminMain key={epoch} admin={ga as Admin} unknownError={unknownError} refresh={refresh} router={router} />
    </ConfirmCtx.Provider>
  );
}

function AdminMain({ admin, unknownError, refresh, router }: {
  admin: Admin; unknownError: string; refresh: () => void; router: ReturnType<typeof useRouter>;
}) {
  const [tab, setTab] = useState<'profile' | 'discord' | 'teams' | 'events' | 'guides'>('profile');
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
    { key: 'teams', label: admin.adminTabTeamsLabel },
    { key: 'events', label: admin.adminTabEventsLabel },
    { key: 'guides', label: admin.adminTabGuidesLabel },
  ];
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
      {tab === 'profile' && <ProfilePanel admin={admin} run={run} flash={setNotice} />}
      {tab === 'discord' && <DiscordPanel admin={admin} run={run} />}
      {tab === 'teams' && <TeamsPanel admin={admin} run={run} />}
      {tab === 'events' && <EventsPanel admin={admin} run={run} />}
      {tab === 'guides' && <GuidesPanel admin={admin} run={run} />}
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

function DiscordPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [webhook, setWebhook] = useState('');
  const [guildId, setGuildId] = useState(admin.discordGuildId ?? '');
  const webhookSet = !!admin.reminderWebhookSet;
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

      <Text style={s.sectionTitle}>{admin.adminFeaturesTitle}</Text>
      <View style={s.card}>
        <View style={s.switchRow}>
          <Text style={s.switchLabel}>{admin.adminFeatureFixedTeamsLabel}</Text>
          <Switch value={!!admin.featureFixedTeams}
            onValueChange={(v) => run(adminUpdateFeatures(slug, v))} />
        </View>
      </View>

      <Text style={s.sectionTitle}>{admin.adminVisibilityTitle}</Text>
      <View style={s.card}>
        <View style={s.switchRow}>
          <Text style={s.switchLabel}>{admin.adminVisibilityLabel}</Text>
          <Switch value={!!admin.devOnly}
            onValueChange={(v) => run(adminUpdateVisibility(slug, v))} />
        </View>
      </View>
    </View>
  );
}

/* ---------- fixed teams ---------- */

const SECTS_M = ['鸣金·虹', '鸣金·影', '牵丝·玉', '牵丝·霖', '牵丝·翊', '裂石·威', '裂石·钧', '破竹·樽', '破竹·鸢', '破竹·尘', '破竹·风'];

function TeamsPanel({ admin, run }: {
  admin: Admin;
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const teams = admin.fixedTeams ?? [];
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  return (
    <View>
      <Text style={s.sectionTitle}>{admin.adminTeamsTitle}</Text>
      {teams.length === 0 && <Text style={s.muted}>{admin.adminTeamEmptyText}</Text>}
      {teams.map((t) => (
        <TeamCard key={t.id} admin={admin} team={t} run={run} />
      ))}
      <View style={s.card}>
        <Field label={admin.adminTeamNameLabel}><TInput value={newName} onChangeText={setNewName} /></Field>
        <Field label={admin.adminTeamDescLabel}><TInput value={newDesc} onChangeText={setNewDesc} /></Field>
        <SaveBtn label={admin.adminAddLabel} savedLabel={admin.adminSavedText}
          onSave={() => { run(adminCreateTeam(slug, { name: newName, description: newDesc })); setNewName(''); setNewDesc(''); }} />
      </View>
    </View>
  );
}

function TeamCard({ admin, team, run }: {
  admin: Admin;
  team: NonNullable<Admin['fixedTeams']>[number];
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [name, setName] = useState(team.name);
  const [desc, setDesc] = useState(team.description ?? '');
  const [nick, setNick] = useState('');
  const [weapon, setWeapon] = useState(SECTS_M[0]);
  const [note, setNote] = useState('');
  return (
    <View style={s.card}>
      <Field label={admin.adminTeamNameLabel}><TInput value={name} onChangeText={setName} /></Field>
      <Field label={admin.adminTeamDescLabel}><TInput value={desc} onChangeText={setDesc} /></Field>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
          onSave={() => run(adminUpdateTeam(slug, team.id, { name, description: desc }))} />
        <Confirmer admin={admin} onConfirm={() => run(adminDeleteTeam(slug, team.id))} />
      </View>
      {(team.members ?? []).map((m) => (
        <MemberRow key={m.id} admin={admin} teamId={team.id} member={m} run={run} />
      ))}
      <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.15)', marginTop: 10, paddingTop: 10 }}>
        <Field label={admin.adminMemberNicknameLabel}><TInput value={nick} onChangeText={setNick} /></Field>
        <Field label={admin.adminMemberWeaponLabel}>
          <View style={s.chipWrap}>
            {SECTS_M.map((w) => (
              <Pressable key={w} onPress={() => setWeapon(w)} style={[s.chip, weapon === w && s.chipOn]}>
                <Text style={[s.chipText, weapon === w && s.chipTextOn]}>{w}</Text>
              </Pressable>
            ))}
          </View>
        </Field>
        <Field label={admin.adminMemberNoteLabel}><TInput value={note} onChangeText={setNote} /></Field>
        <SaveBtn label={admin.adminAddLabel} savedLabel={admin.adminSavedText}
          onSave={() => { run(adminAddMember(slug, team.id, { nickname: nick, weapon, note })); setNick(''); setNote(''); }} />
      </View>
    </View>
  );
}

function MemberRow({ admin, teamId, member, run }: {
  admin: Admin;
  teamId: string;
  member: { id: string; nickname: string; weapon: string; role: string; note?: string | null };
  run: (p: Promise<AdminPayload>, onOk?: () => void) => void;
}) {
  const slug = admin.slug;
  const [editing, setEditing] = useState(false);
  const [nick, setNick] = useState(member.nickname);
  const [weapon, setWeapon] = useState(member.weapon);
  const [note, setNote] = useState(member.note ?? '');
  if (!editing) {
    return (
      <View style={s.memberRow}>
        <Text style={s.memberName}>{member.nickname}</Text>
        <Text style={s.muted}>{member.weapon}</Text>
        <Text style={[s.roleChip, member.role === '奶' && s.roleChipHeal]}>{member.role}</Text>
        <Pressable onPress={() => setEditing(true)} hitSlop={6}>
          <Text style={s.linkText}>{admin.adminEditLabel}</Text>
        </Pressable>
        <Confirmer admin={admin} small onConfirm={() => run(adminDeleteMember(slug, teamId, member.id))} />
      </View>
    );
  }
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.15)', paddingTop: 10, marginTop: 6 }}>
      <Field label={admin.adminMemberNicknameLabel}><TInput value={nick} onChangeText={setNick} /></Field>
      <Field label={admin.adminMemberWeaponLabel}>
        <View style={s.chipWrap}>
          {SECTS_M.map((w) => (
            <Pressable key={w} onPress={() => setWeapon(w)} style={[s.chip, weapon === w && s.chipOn]}>
              <Text style={[s.chipText, weapon === w && s.chipTextOn]}>{w}</Text>
            </Pressable>
          ))}
        </View>
      </Field>
      <Field label={admin.adminMemberNoteLabel}><TInput value={note} onChangeText={setNote} /></Field>
      <SaveBtn label={admin.adminSaveLabel} savedLabel={admin.adminSavedText}
        onSave={() => { run(adminUpdateMember(slug, teamId, member.id, { nickname: nick, weapon, note })); setEditing(false); }} />
    </View>
  );
}

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
