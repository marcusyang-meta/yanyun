import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts, theme } from '../theme';
import { CardFill, Seal } from '../components/ui';
import { useSession } from '../session';
import {
  applyToGuildRemote,
  type HomeRecruitData,
  type HomeRecruitGuildItem,
  type HomeRecruitNewcomerItem,
  type RecruitApplicationItem,
} from '../api';

// Platform-home recruit section (Viewer.homeRecruit via session):
// the recruit line's only member surface since the standalone
// recruit page dissolved into the home. The server composes the
// section per viewer — the guild directory is public; an application
// section exists on an entry only for a logged-in non-member of that
// guild; newcomer entries exist only for members (checklist) and the
// paired (pairings). This component renders exactly what was
// composed and carries no membership logic of its own.
function StatusChip({ label }: { label: string }) {
  return <Text style={s.statusChip}>{label}</Text>;
}

function ApplicationBlock({ section, slug, application }: {
  section: HomeRecruitData;
  slug: string;
  application?: RecruitApplicationItem | null;
}) {
  const { refresh, text } = useSession();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const app = application ?? null;
  // The apply form shows when there is no application yet, or the
  // latest one was rejected (the backend allows a fresh application
  // then, and the rejected hint copy says so).
  const showApplyForm = !app || app.status === 'REJECTED';
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await applyToGuildRemote(slug, message.trim() ? message : undefined);
      if (res?.ok) {
        setMessage('');
        await refresh();
      } else {
        setError(res?.error || text.commonUnknownErrorText || '');
      }
    } catch {
      setError(text.commonUnknownErrorText || '');
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={s.appBlock}>
      {!!app && (
        <View style={{ marginBottom: showApplyForm ? 14 : 0 }}>
          <Text style={s.subTitle}>{section.myApplicationTitle}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={s.memberName}>{app.applicantName}</Text>
            <StatusChip label={app.statusLabel} />
            <Text style={s.muted}>{app.createdAtText}</Text>
            {!!app.reviewedAtText && (
              <Text style={s.muted}>{app.reviewedByName} · {app.reviewedAtText}</Text>
            )}
          </View>
          {!!app.message && <Text style={[s.body, { color: theme.paper, marginTop: 6 }]}>{app.message}</Text>}
          {app.status === 'PENDING' && <Text style={[s.body, { marginTop: 6 }]}>{section.pendingHint}</Text>}
          {app.status === 'APPROVED' && <Text style={[s.body, { color: theme.paper, marginTop: 6 }]}>{section.approvedNextStepText}</Text>}
          {app.status === 'REJECTED' && <Text style={[s.body, { marginTop: 6 }]}>{section.rejectedHint}</Text>}
        </View>
      )}
      {showApplyForm && (
        <View>
          <Text style={s.subTitle}>{section.applySectionTitle}</Text>
          <Text style={s.label}>{section.messageLabel}</Text>
          <TextInput
            style={s.input}
            value={message}
            maxLength={200}
            multiline
            placeholder={section.messagePlaceholder}
            placeholderTextColor={theme.muted}
            onChangeText={setMessage}
          />
          {!!error && <Text style={s.error}>{error}</Text>}
          <Pressable style={s.goldBtn} disabled={busy} onPress={() => { void submit(); }}>
            <Text style={s.goldBtnText}>{busy ? section.submittingLabel : section.submitLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function NewcomerCard({ section, entry }: { section: HomeRecruitData; entry: HomeRecruitNewcomerItem }) {
  return (
    <View style={s.card}>
      <CardFill />
      <Text style={s.sectionTitle}>{entry.guildName}</Text>
      {!!entry.checklist && (
        <View style={{ marginBottom: entry.myPairings && entry.myPairings.length > 0 ? 16 : 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
            <Text style={s.subTitleNoMargin}>{section.checklistTitle}</Text>
            <Text style={s.muted}>{entry.checklist.progressText}</Text>
          </View>
          {entry.checklist.items.map((item) => (
            <View key={item.key} style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <View style={[s.checkDot, item.done ? s.checkDotDone : null]}>
                {!!item.done && <Text style={{ color: theme.goldHi, fontSize: 12 }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.memberName}>{item.label}</Text>
                <Text style={s.muted}>{item.hint}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      {!!entry.myPairings && entry.myPairings.length > 0 && (
        <View>
          <Text style={s.subTitle}>{section.myPairingsTitle}</Text>
          {entry.myPairings.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <Text style={s.muted}>{section.pairingMentorRoleLabel}</Text>
              <Text style={s.memberName}>{p.mentorName}</Text>
              <Text style={s.muted}>{section.pairingMenteeRoleLabel}</Text>
              <Text style={s.memberName}>{p.menteeName}</Text>
              <StatusChip label={p.statusLabel} />
              <Text style={s.muted}>{p.createdAtText}</Text>
              {!!p.endedAtText && <Text style={s.muted}>{p.endedAtText}</Text>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function DirectoryCard({ section, g }: { section: HomeRecruitData; g: HomeRecruitGuildItem }) {
  return (
    <View style={s.card}>
      <CardFill />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {g.avatarUrl ? (
          <Image source={{ uri: g.avatarUrl }} style={s.avatar} />
        ) : (
          <Seal char="燕" size={48} />
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.gname}>{g.name}</Text>
          {!!g.slogan && <Text style={s.slogan} numberOfLines={1}>{g.slogan}</Text>}
        </View>
      </View>
      {!!g.myApplicationSection && (
        <ApplicationBlock section={section} slug={g.slug} application={g.myApplicationSection.application} />
      )}
    </View>
  );
}

export default function HomeRecruitSection({ section }: { section: HomeRecruitData | null }) {
  if (!section) return null;
  if (section.guilds.length === 0 && section.myNewcomer.length === 0) return null;
  return (
    <View style={{ marginTop: 34 }}>
      <View style={s.sectionHead}>
        <Text style={s.sectionZh}>{section.recruitTitle}</Text>
      </View>
      <Text style={s.body}>{section.homeBody}</Text>
      {section.myNewcomer.map((entry) => (
        <NewcomerCard key={entry.slug} section={section} entry={entry} />
      ))}
      {section.guilds.map((g) => (
        <DirectoryCard key={g.slug} section={section} g={g} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  sectionZh: { fontFamily: fonts.brush, color: theme.goldHi, fontSize: 22, letterSpacing: 2 },
  sectionTitle: { fontFamily: fonts.brush, color: theme.gold, fontSize: 15, letterSpacing: 2, marginBottom: 10 },
  subTitle: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13, letterSpacing: 1, marginBottom: 8 },
  subTitleNoMargin: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13, letterSpacing: 1 },
  card: {
    marginTop: 14, padding: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    borderColor: 'rgba(201,163,92,.22)', backgroundColor: 'rgba(236,226,203,.03)',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.45)', backgroundColor: 'rgba(201,163,92,.08)',
  },
  gname: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 17, fontWeight: '600' },
  slogan: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, marginTop: 3 },
  body: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, lineHeight: 20 },
  muted: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5 },
  memberName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  label: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 6 },
  input: {
    fontFamily: fonts.serif, color: theme.paper, fontSize: 14, minHeight: 64,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.3)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, textAlignVertical: 'top',
  },
  appBlock: { marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.16)', paddingTop: 14 },
  statusChip: {
    fontFamily: fonts.serif, fontSize: 11, color: theme.muted,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.3)', borderRadius: 999,
    paddingVertical: 1, paddingHorizontal: 8, overflow: 'hidden',
  },
  checkDot: {
    width: 22, height: 22, borderRadius: 11, marginTop: 1,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  checkDotDone: { borderColor: theme.gold, backgroundColor: 'rgba(201,163,92,.16)' },
  error: { fontFamily: fonts.serif, color: '#e8a09a', fontSize: 13, marginTop: 8 },
  goldBtn: {
    marginTop: 12, alignSelf: 'flex-start', borderRadius: 10,
    backgroundColor: 'rgba(201,163,92,.18)', borderWidth: 1, borderColor: theme.gold,
    paddingVertical: 9, paddingHorizontal: 24,
  },
  goldBtnText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
});
