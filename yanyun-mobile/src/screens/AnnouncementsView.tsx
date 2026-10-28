import React, { Suspense, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme } from '../theme';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { AnnouncementsAdminQuery, AnnouncementsPageQuery } from '../documents';
import {
  deleteGuildAnnouncementRemote, generateGuildAnnouncementTranslationsRemote,
  markGuildAnnouncementReadRemote, postGuildAnnouncementRemote,
} from '../api';
import type { documentsAnnouncementsPageQuery } from '../__generated__/documentsAnnouncementsPageQuery.graphql';
import type { documentsAnnouncementsAdminQuery } from '../__generated__/documentsAnnouncementsAdminQuery.graphql';

// Guild announcements (communication line F9/F10/F18), the mobile
// form of the Web guild-home announcements tab and admin tab. All
// copy arrives on the GuildAnnouncementPage shell; this file holds
// structure only. Member view: list + open-to-read (opening fires
// the mark-read mutation once, F10). Admin panel: the same list
// plus the compose form and per-announcement read receipts, fed
// from viewer.guildAdmin — reaching it at all is the server's
// admin verdict. Destructive delete arms on first tap and fires
// on second (the admin screen's standing pattern).

type Item = {
  id: string;
  urgent: boolean;
  urgentLabel?: string | null;
  kindLabel: string;
  title: string;
  body: string;
  displayTitle?: string | null;
  displayBody?: string | null;
  isTranslated?: boolean | null;
  contentSourceLabel?: string | null;
  translationStatusText?: string | null;
  translations?: readonly {
    locale: string;
    localeLabel: string;
    status: string;
    statusLabel: string;
  }[] | null;
  authorText?: string | null;
  createdAtText: string;
  viewerHasRead?: boolean | null;
  readCountText?: string | null;
  deleteLabel?: string | null;
  deleteConfirmTitle?: string | null;
  receipts?: readonly {
    discordId: string;
    displayName: string;
    read: boolean;
    readAtText?: string | null;
  }[] | null;
};

function AnnouncementCard({ item, slug, admin, page, onChanged }: {
  item: Item;
  slug: string;
  admin: boolean;
  page: any;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [readLocal, setReadLocal] = useState<boolean | null>(null);
  const [armed, setArmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const hasRead = readLocal ?? item.viewerHasRead;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && item.viewerHasRead === false && readLocal !== true) {
      void markGuildAnnouncementReadRemote(slug, item.id)
        .then((p) => { if (p?.ok) setReadLocal(true); })
        .catch(() => {});
    }
  };

  const receipts = item.receipts ?? null;
  const readNames = (receipts ?? []).filter((r) => r.read);
  const unreadNames = (receipts ?? []).filter((r) => !r.read);

  return (
    <View style={[s.card, item.urgent && s.cardUrgent]}>
      <Pressable onPress={toggle} style={s.cardHead}>
        {item.urgent && !!item.urgentLabel && (
          <View style={s.urgentBadge}><Text style={s.urgentBadgeText}>{item.urgentLabel}</Text></View>
        )}
        <Text style={s.cardTitle}>{item.displayTitle ?? item.title}</Text>
        {item.isTranslated && !!item.contentSourceLabel && (
          <View style={s.translatedBadge}><Text style={s.translatedBadgeText}>{item.contentSourceLabel}</Text></View>
        )}
        {hasRead === false && <View style={s.unreadDot} />}
        <Text style={s.cardTime}>{item.createdAtText}</Text>
      </Pressable>
      {open && (
        <View>
          <View style={s.metaRow}>
            <Text style={s.meta}>{item.kindLabel}</Text>
            {!!item.authorText && <Text style={s.meta}>{item.authorText}</Text>}
          </View>
          {!!(item.displayBody ?? item.body) && <Text style={s.body}>{item.displayBody ?? item.body}</Text>}
          {admin && !!item.translationStatusText && (
            <View style={s.receipts}>
              <Text style={s.receiptsTitle}>{item.translationStatusText}</Text>
              {!!item.translations?.length && (
                <Text style={s.receiptNames}>
                  {item.translations.map((t) => `${t.localeLabel} · ${t.statusLabel}`).join('　')}
                </Text>
              )}
              {!!page.translationUnavailableText && (
                <Text style={[s.receiptNames, s.receiptUnread]}>{page.translationUnavailableText}</Text>
              )}
              {!!page.generateTranslationsLabel && (
                <Pressable
                  style={[s.deleteBtn, (!page.canGenerateTranslations || generating) && s.generateBtnDisabled]}
                  disabled={!page.canGenerateTranslations || generating}
                  onPress={() => {
                    setGenerating(true);
                    void generateGuildAnnouncementTranslationsRemote(slug, item.id)
                      .then((p) => { if (p?.ok) onChanged(); })
                      .catch(() => {})
                      .finally(() => setGenerating(false));
                  }}
                >
                  <Text style={s.generateBtnText}>
                    {generating ? page.generatingTranslationsLabel : page.generateTranslationsLabel}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
          {admin && receipts && (
            <View style={s.receipts}>
              <Text style={s.receiptsTitle}>
                {page.receiptsTitle}
                {item.readCountText ? ` · ${item.readCountText}` : ''}
              </Text>
              {readNames.length > 0 && (
                <Text style={s.receiptNames}>
                  {`${page.readListLabel}：${readNames.map((r) => r.displayName).join('、')}`}
                </Text>
              )}
              {unreadNames.length > 0 && (
                <Text style={[s.receiptNames, s.receiptUnread]}>
                  {`${page.unreadListLabel}：${unreadNames.map((r) => r.displayName).join('、')}`}
                </Text>
              )}
              {!!item.deleteLabel && (
                <Pressable
                  style={[s.deleteBtn, armed && s.deleteBtnArmed]}
                  onPress={() => {
                    if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 2600); return; }
                    setArmed(false);
                    void deleteGuildAnnouncementRemote(slug, item.id)
                      .then((p) => { if (p?.ok) onChanged(); })
                      .catch(() => {});
                  }}
                >
                  <Text style={[s.deleteBtnText, armed && s.deleteBtnTextArmed]}>
                    {armed ? (item.deleteConfirmTitle ?? item.deleteLabel) : item.deleteLabel}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

/* ---------------- member view (guild home section) ---------------- */

export default function AnnouncementsView({ slug }: { slug: string }) {
  const [epoch, setEpoch] = useState(0);
  return (
    <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
      <Suspense fallback={<LoadingView />}>
        <MemberList slug={slug} epoch={epoch} />
      </Suspense>
    </AsyncBoundary>
  );
}

function MemberList({ slug, epoch }: { slug: string; epoch: number }) {
  const data = useLazyLoadQuery<documentsAnnouncementsPageQuery>(
    AnnouncementsPageQuery, { slug }, { fetchPolicy: 'store-or-network', fetchKey: epoch },
  );
  const guild: any = data.viewer?.guild;
  const page: any = guild?.announcements;
  if (!page) return <LoadingView />;
  const items: Item[] = page.announcements ?? [];
  return (
    <ScrollView contentContainerStyle={s.listContent}>
      {items.length === 0 ? (
        <Text style={s.empty}>{page.emptyText}</Text>
      ) : (
        items.map((item) => (
          <AnnouncementCard key={item.id} item={item} slug={slug} admin={false} page={page} onChanged={() => {}} />
        ))
      )}
    </ScrollView>
  );
}

/* ---------------- admin panel (guild admin tab) ---------------- */

export function AnnouncementsAdminPanel({ slug }: { slug: string }) {
  const [epoch, setEpoch] = useState(0);
  return (
    <AsyncBoundary key={epoch} onRetry={() => setEpoch((e) => e + 1)}>
      <Suspense fallback={<LoadingView />}>
        <AdminList slug={slug} epoch={epoch} refresh={() => setEpoch((e) => e + 1)} />
      </Suspense>
    </AsyncBoundary>
  );
}

function AdminList({ slug, epoch, refresh }: { slug: string; epoch: number; refresh: () => void }) {
  const data = useLazyLoadQuery<documentsAnnouncementsAdminQuery>(
    AnnouncementsAdminQuery, { slug }, { fetchPolicy: 'store-or-network', fetchKey: epoch },
  );
  const ga: any = data.viewer?.guildAdmin;
  const page: any = ga?.announcements;
  const unknownError = data.viewer?.commonUnknownErrorText ?? '';
  const [kind, setKind] = useState<'STANDARD' | 'URGENT'>('STANDARD');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  if (!page) return <LoadingView />;
  const items: Item[] = page.announcements ?? [];

  const submit = async () => {
    if (posting) return;
    setPosting(true);
    setError('');
    setNotice('');
    try {
      const p = await postGuildAnnouncementRemote(slug, kind, title, body);
      if (p?.ok) {
        setNotice(page.postedText);
        setTitle('');
        setBody('');
        setKind('STANDARD');
        refresh();
      } else {
        setError(p?.error || unknownError);
      }
    } catch { setError(unknownError); } finally { setPosting(false); }
  };

  return (
    <View>
      {!!error && <Text style={s.error}>{error}</Text>}
      {!!notice && <Text style={s.notice}>{notice}</Text>}
      {page.canPost && (
        <View style={s.compose}>
          <Text style={s.sectionTitle}>{page.composeTitle}</Text>
          <Text style={s.label}>{page.kindLabel}</Text>
          <View style={s.kindRow}>
            {(['STANDARD', 'URGENT'] as const).map((value) => {
              const on = kind === value;
              const label = value === 'URGENT' ? page.kindUrgentLabel : page.kindStandardLabel;
              return (
                <Pressable
                  key={value}
                  onPress={() => setKind(value)}
                  style={[s.kindBtn, on && (value === 'URGENT' ? s.kindBtnUrgentOn : s.kindBtnOn)]}
                >
                  <Text style={[s.kindBtnText, on && s.kindBtnTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={s.label}>{page.titleLabel}</Text>
          <TextInput
            style={s.input}
            value={title}
            onChangeText={setTitle}
            placeholder={page.titlePlaceholder}
            placeholderTextColor={theme.muted}
          />
          <Text style={s.label}>{page.bodyLabel}</Text>
          <TextInput
            style={[s.input, s.inputMulti]}
            value={body}
            onChangeText={setBody}
            placeholder={page.bodyPlaceholder}
            placeholderTextColor={theme.muted}
            multiline
          />
          <Text style={s.note}>
            {page.pushNote}
            {kind === 'URGENT' ? ` ${page.urgentNote}` : ''}
            {page.dailyLimitText ? ` ${page.dailyLimitText}` : ''}
          </Text>
          <Pressable
            style={[s.postBtn, kind === 'URGENT' && s.postBtnUrgent, posting && s.postBtnBusy]}
            onPress={submit}
          >
            <Text style={[s.postBtnText, kind === 'URGENT' && s.postBtnTextUrgent]}>
              {posting ? page.postingLabel : page.postLabel}
            </Text>
          </Pressable>
        </View>
      )}
      {items.length === 0 ? (
        <Text style={s.empty}>{page.emptyText}</Text>
      ) : (
        items.map((item) => (
          <AnnouncementCard key={item.id} item={item} slug={slug} admin page={page} onChanged={refresh} />
        ))
      )}
    </View>
  );
}

const s = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 32 },
  empty: { color: theme.muted, fontSize: 14, textAlign: 'center', paddingVertical: 28 },
  card: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.22)', backgroundColor: 'rgba(236,226,203,.03)',
    borderRadius: 12, padding: 14, marginTop: 12,
  },
  cardUrgent: { borderColor: 'rgba(192,57,43,.55)', backgroundColor: 'rgba(192,57,43,.07)' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgentBadge: { backgroundColor: theme.danger, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  urgentBadgeText: { color: '#fff', fontSize: 11, letterSpacing: 1 },
  translatedBadge: { borderColor: theme.gold, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  translatedBadgeText: { color: theme.gold, fontSize: 11, letterSpacing: 1 },
  generateBtnDisabled: { opacity: 0.45 },
  generateBtnText: { fontSize: 12, color: theme.gold },
  cardTitle: { fontSize: 15, color: theme.paper, fontWeight: '600', flexShrink: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.gold },
  cardTime: { marginLeft: 'auto', fontSize: 12, color: theme.muted },
  metaRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  meta: { fontSize: 12, color: theme.muted },
  body: { fontSize: 14, color: theme.paper, lineHeight: 24, marginTop: 6 },
  receipts: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.15)', paddingTop: 10 },
  receiptsTitle: { fontSize: 12, color: theme.muted, letterSpacing: 1 },
  receiptNames: { fontSize: 13, color: theme.paper, lineHeight: 22, marginTop: 6 },
  receiptUnread: { color: theme.muted },
  deleteBtn: {
    alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,163,92,.35)',
  },
  deleteBtnArmed: { borderColor: theme.danger, backgroundColor: 'rgba(192,57,43,.18)' },
  deleteBtnText: { fontSize: 12, color: theme.muted },
  deleteBtnTextArmed: { color: '#e8a09a' },
  compose: {
    marginTop: 6, padding: 16, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(201,163,92,.22)', backgroundColor: 'rgba(236,226,203,.03)',
  },
  sectionTitle: { fontSize: 16, color: theme.goldHi, fontFamily: fonts.serif, marginBottom: 6 },
  label: { fontSize: 12, color: theme.muted, letterSpacing: 1, marginTop: 10, marginBottom: 6 },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
  },
  kindBtnOn: { borderColor: theme.gold, backgroundColor: 'rgba(201,163,92,.16)' },
  kindBtnUrgentOn: { borderColor: theme.danger, backgroundColor: 'rgba(192,57,43,.2)' },
  kindBtnText: { fontSize: 13, color: theme.muted },
  kindBtnTextOn: { color: theme.goldHi },
  input: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.35)', backgroundColor: 'rgba(12,11,9,.6)',
    color: theme.paper, fontSize: 14, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9,
  },
  inputMulti: { minHeight: 96, textAlignVertical: 'top' },
  note: { fontSize: 12, color: theme.muted, lineHeight: 19, marginTop: 10 },
  postBtn: {
    marginTop: 12, alignSelf: 'flex-end', backgroundColor: theme.gold,
    borderRadius: 8, paddingHorizontal: 22, paddingVertical: 9,
  },
  postBtnUrgent: { backgroundColor: theme.danger },
  postBtnBusy: { opacity: 0.6 },
  postBtnText: { fontSize: 14, fontWeight: '600', color: theme.onGold },
  postBtnTextUrgent: { color: '#fff' },
  error: { color: '#e8a09a', fontSize: 13, marginTop: 10 },
  notice: { color: theme.goldHi, fontSize: 13, marginTop: 10 },
});
