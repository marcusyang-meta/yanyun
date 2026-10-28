import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { fonts, theme } from '../theme';
import { GoldFill } from '../components/ui';

// Same semantics as Web lib/format fill: {key} placeholder substitution.
export function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

/* Toast (same semantics as Web Toast: module-level show + host rendering) */
const toastListeners = new Set<(msg: string) => void>();
export function gearToast(msg: string): void {
  toastListeners.forEach((f) => f(msg));
}

export function GearToastHost() {
  const [msg, setMsg] = useState('');
  const [seq, setSeq] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const fn = (m: string) => {
      setMsg(m);
      setSeq((n) => n + 1);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMsg(''), 2600);
    };
    toastListeners.add(fn);
    return () => { toastListeners.delete(fn); if (timer.current) clearTimeout(timer.current); };
  }, []);
  if (!msg) return null;
  return (
    <View key={seq} pointerEvents="none" style={s.toastWrap}>
      <View style={s.toast}>
        <Text style={s.toastText}>{msg}</Text>
      </View>
    </View>
  );
}

/* Confirm dialog (same structure as Web ConfirmDialog) */
export function GearConfirmDialog(props: {
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  onOk: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={props.onCancel}>
      <Pressable style={s.overlay} onPress={props.onCancel}>
        <Pressable style={s.dialog} onPress={() => {}}>
          <Text style={s.dialogTitle}>{props.title}</Text>
          {!!props.message && <Text style={s.dialogMsg}>{props.message}</Text>}
          <View style={s.dialogBtns}>
            <Pressable style={s.btnGhost} onPress={props.onCancel}>
              <Text style={s.btnGhostText}>{props.cancelLabel}</Text>
            </Pressable>
            <Pressable style={s.btnGold} onPress={props.onOk}>
              <GoldFill />
              <Text style={s.btnGoldText}>{props.okLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* Base controls (styles mirror Web GearBench/GearLibrary inp/sel/lbl/btn) */
export function Lbl({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={s.lblRow}>
      <Text style={s.lbl}>{children}</Text>
      {right}
    </View>
  );
}

export function NumInput(props: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: object;
}) {
  return (
    <TextInput
      style={[s.inp, props.disabled && { opacity: 0.55 }, props.style]}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={theme.muted}
      keyboardType="decimal-pad"
      editable={!props.disabled}
    />
  );
}

export function TextInp(props: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  style?: object;
}) {
  return (
    <TextInput
      style={[s.inp, props.multiline && { minHeight: 54, textAlignVertical: 'top' }, props.style]}
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={theme.muted}
      editable={!props.disabled}
      multiline={props.multiline}
    />
  );
}

export type SheetOption = { value: string; label: string };

// Dropdown (RN has no native select; presented as a bottom sheet, with
// search when options are many) -- visually and behaviorally aligned with
// Web's <select>: current value in the box, tap to pick one and close.
export function SheetSelect(props: {
  value: string;
  options: SheetOption[];
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: object;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const cur = props.options.find((o) => o.value === props.value);
  const shown = q.trim()
    ? props.options.filter((o) => o.label.includes(q.trim()))
    : props.options;
  return (
    <>
      <Pressable
        style={[s.inp, s.selectBox, props.disabled && { opacity: 0.55 }, props.style]}
        disabled={props.disabled}
        onPress={() => { setQ(''); setOpen(true); }}
      >
        <Text style={[s.selectText, !cur && { color: theme.muted }]} numberOfLines={1}>
          {cur ? cur.label : (props.placeholder ?? '')}
        </Text>
        <Text style={s.selectCaret}>▾</Text>
      </Pressable>
      {open && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={s.sheetOverlay} onPress={() => setOpen(false)}>
            <Pressable style={s.sheet} onPress={() => {}}>
              {props.options.length > 12 && (
                <TextInput
                  style={[s.inp, { marginBottom: 8 }]}
                  value={q}
                  onChangeText={setQ}
                  placeholder={props.searchPlaceholder ?? '…'}
                  placeholderTextColor={theme.muted}
                />
              )}
              <ScrollView style={{ maxHeight: 380 }} keyboardShouldPersistTaps="handled">
                {shown.map((o) => (
                  <Pressable
                    key={o.value + '|' + o.label}
                    style={[s.sheetRow, o.value === props.value && s.sheetRowOn]}
                    onPress={() => { props.onChange(o.value); setOpen(false); }}
                  >
                    <Text style={[s.sheetRowText, o.value === props.value && { color: theme.accentHi, fontWeight: '700' }]}>
                      {o.label}
                    </Text>
                  </Pressable>
                ))}
                {shown.length === 0 && (
                  <Text style={s.sheetEmpty}>—</Text>
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </>
  );
}

export function BtnGold(props: { label: string; onPress: () => void; disabled?: boolean; style?: object }) {
  return (
    <Pressable
      style={[s.btnGold, props.disabled && { opacity: 0.45 }, props.style]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <GoldFill />
      <Text style={s.btnGoldText}>{props.label}</Text>
    </Pressable>
  );
}

export function BtnGhost(props: { label: string; onPress: () => void; disabled?: boolean; style?: object }) {
  return (
    <Pressable
      style={[s.btnGhost, props.disabled && { opacity: 0.45 }, props.style]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={s.btnGhostText}>{props.label}</Text>
    </Pressable>
  );
}

export function BtnMini(props: {
  label: string; onPress: () => void; disabled?: boolean; active?: boolean; style?: object; textStyle?: object;
}) {
  return (
    <Pressable
      style={[s.btnMini, props.active && s.btnMiniOn, props.disabled && { opacity: 0.45 }, props.style]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <Text style={[s.btnMiniText, props.active && s.btnMiniTextOn, props.textStyle]}>{props.label}</Text>
    </Pressable>
  );
}

export function CheckRow(props: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable
      style={s.checkRow}
      disabled={props.disabled}
      onPress={() => props.onChange(!props.checked)}
    >
      <View style={[s.checkBox, props.checked && s.checkBoxOn]}>
        {props.checked && <Text style={s.checkMark}>✓</Text>}
      </View>
      <Text style={s.checkLabel}>{props.label}</Text>
    </Pressable>
  );
}

export function SecTitle({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[s.secTitle, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  toastWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 46, alignItems: 'center', zIndex: 99,
  },
  toast: {
    backgroundColor: 'rgba(30,33,38,.96)', borderWidth: 1, borderColor: theme.accent,
    borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18, maxWidth: '88%',
  },
  toastText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 13.5, textAlign: 'center' },
  overlay: {
    flex: 1, backgroundColor: 'rgba(6,5,4,.72)',
    alignItems: 'center', justifyContent: 'center', padding: 22,
  },
  dialog: {
    width: '100%', maxWidth: 420, backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, padding: 22,
  },
  dialogTitle: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 17, marginBottom: 8 },
  dialogMsg: { fontFamily: fonts.body, color: theme.paper, fontSize: 13.5, lineHeight: 21, marginBottom: 16 },
  dialogBtns: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  lblRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  lbl: { fontFamily: fonts.body, color: theme.muted, fontSize: 11 },
  inp: {
    backgroundColor: 'rgba(0,0,0,.35)', color: theme.paper,
    borderWidth: 1, borderColor: 'rgba(67,160,134,.35)', borderRadius: 6,
    paddingVertical: 6, paddingHorizontal: 8, fontSize: 13, fontFamily: fonts.body,
  },
  selectBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectText: { flex: 1, fontFamily: fonts.body, color: theme.paper, fontSize: 13 },
  selectCaret: { color: theme.accent, fontSize: 11 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(6,5,4,.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.ink2, borderTopWidth: 1, borderTopColor: theme.border,
    borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 14, paddingBottom: 28,
    maxHeight: '78%',
  },
  sheetRow: { paddingVertical: 11, paddingHorizontal: 10, borderRadius: 8 },
  sheetRowOn: { backgroundColor: 'rgba(67,160,134,.13)' },
  sheetRowText: { fontFamily: fonts.body, color: theme.paper, fontSize: 14.5 },
  sheetEmpty: { fontFamily: fonts.body, color: theme.muted, fontSize: 13, textAlign: 'center', padding: 14 },
  btnGold: {
    position: 'relative', overflow: 'hidden', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(147,210,190,.5)',
    paddingVertical: 7, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
  },
  btnGoldText: { fontFamily: fonts.body, color: theme.onAccent, fontSize: 13, fontWeight: '600' },
  btnGhost: {
    borderWidth: 1, borderColor: theme.accent, borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center',
  },
  btnGhostText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 12.5 },
  btnMini: {
    borderWidth: 1, borderColor: theme.accent, borderRadius: 6,
    paddingVertical: 3, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center',
  },
  btnMiniOn: { backgroundColor: theme.accent },
  btnMiniText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 12 },
  btnMiniTextOn: { color: theme.onAccent, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkBox: {
    width: 19, height: 19, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(67,160,134,.5)',
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,.3)',
  },
  checkBoxOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  checkMark: { color: theme.onAccent, fontSize: 12, fontWeight: '700', lineHeight: 14 },
  checkLabel: { fontFamily: fonts.body, color: theme.paper, fontSize: 12.5 },
  secTitle: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 15, marginBottom: 8 },
  card: {
    borderWidth: 1, borderColor: 'rgba(67,160,134,.22)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,.25)',
  },
});
