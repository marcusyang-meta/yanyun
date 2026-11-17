// Entry mapping for the guild home's floating bottom capsule bar
// (IG-style: one floating capsule is the guild's main navigation).
// Pure data in / out — no React Native imports — so the mapping is
// unit-testable; GuildTabBar renders whatever this returns.
//
// The capsule mirrors the guild shell's section set, which the backend
// composes per guild (labels are the shell's homeTab*Label fields —
// the client never fabricates them):
//   team          -> 组队 (grouping list)
//   dex + sect    -> 攻略 (one capsule entry covering both guide
//                    sections; the dex/sect switch itself stays an
//                    in-section control, see GroupingListScreen)
//   announcements -> 公告 (only when the shell carries its label)
//   schedule      -> 排期 (only when the shell carries its label)
//   insights      -> the race-season board (only when the shell
//                    composed the full board variant for this guild)
//   profile       -> 我的 (always last; routes to the Profile page,
//                    labelled with the shell's settings label)
export type GuildTabIcon = 'team' | 'dex' | 'announcements' | 'schedule' | 'insights' | 'profile';

export type GuildTabEntry = {
  // Section key the entry activates ('profile' routes instead).
  key: string;
  label: string;
  icon: GuildTabIcon;
  active: boolean;
};

export type GuildSectionLabels = readonly (readonly [string, string])[];

export function buildGuildTabEntries(args: {
  sectionLabels: GuildSectionLabels | null;
  section: string;
  profileLabel?: string | null;
}): GuildTabEntry[] | null {
  const { sectionLabels, section, profileLabel } = args;
  // The shell labels are the gate, exactly like the section pill row
  // before: without them there is no composed section set to mirror,
  // and the screen keeps its single-surface form (no capsule).
  if (!sectionLabels) return null;
  const entries: GuildTabEntry[] = [];
  for (const [key, label] of sectionLabels) {
    if (key === 'team') {
      entries.push({ key: 'team', label, icon: 'team', active: section === 'team' });
    } else if (key === 'dex') {
      // 攻略 covers dex and sect: active for either, activates dex.
      entries.push({ key: 'dex', label, icon: 'dex', active: section === 'dex' || section === 'sect' });
    } else if (key === 'sect') {
      // Folded into the 攻略 entry above.
    } else if (key === 'announcements') {
      entries.push({ key: 'announcements', label, icon: 'announcements', active: section === 'announcements' });
    } else if (key === 'schedule') {
      entries.push({ key: 'schedule', label, icon: 'schedule', active: section === 'schedule' });
    } else if (key === 'insights') {
      entries.push({ key: 'insights', label, icon: 'insights', active: section === 'insights' });
    }
  }
  entries.push({ key: 'profile', label: profileLabel ?? '', icon: 'profile', active: false });
  return entries;
}
