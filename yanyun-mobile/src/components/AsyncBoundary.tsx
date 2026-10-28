import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, theme } from '../theme';
import { useSession } from '../session';

// Relay surface boundary: a query error (incl. blocks field errors) shows
// a native retry state instead of a blank screen; retry is triggered by
// the parent changing fetchKey (remounting this boundary resets the error
// state). Error copy uses the viewer's commonRenderErrorTemplate
// ({message}) + commonRenderErrorHint (same fields as the Web error
// boundary); the placeholder below is used only before session copy is
// ready. Retry/loading copy has no catalog fields yet (commonLoadingText
// / commonRetryLabel are pending backend fields); placeholders are kept
// for now and listed in the missing-fields list.
export class AsyncBoundary extends React.Component<
  { children: React.ReactNode; onRetry: () => void },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <BoundaryError message={String(this.state.error.message || this.state.error)} onRetry={this.props.onRetry} />;
    }
    return this.props.children;
  }
}

function BoundaryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { text } = useSession();
  const tpl = text.commonRenderErrorTemplate;
  const main = tpl ? tpl.split('{message}').join(message) : '加载失败，请检查网络后重试';
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{main}</Text>
      {!!text.commonRenderErrorHint && <Text style={styles.hint}>{text.commonRenderErrorHint}</Text>}
      <Pressable style={styles.btn} onPress={onRetry}>
        <Text style={styles.btnText}>重试</Text>
      </Pressable>
    </View>
  );
}

export function LoadingView({ label = '加载中…' }: { label?: string }) {
  return (
    <View style={styles.box}>
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { paddingVertical: 48, alignItems: 'center', gap: 16 },
  text: { fontFamily: fonts.body, color: '#e08080', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  loadingText: { fontFamily: fonts.body, color: theme.muted, fontSize: 14 },
  hint: { fontFamily: fonts.body, color: theme.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  btn: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  btnText: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 14, fontWeight: '600' },
});
