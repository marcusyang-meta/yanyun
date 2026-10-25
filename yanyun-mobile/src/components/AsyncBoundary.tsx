import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, theme } from '../theme';
import { useSession } from '../session';

// Relay 表面边界: 查询出错 (含 blocks 字段报错) → 原生重试态, 不白屏；
// 重试由父级换 fetchKey 触发 (连同本边界一起 remount 复位错误态)。
// 错误文案走 viewer 的 commonRenderErrorTemplate ({message}) +
// commonRenderErrorHint (与 Web 错误边界同源字段); 会话文案未就绪时
// 才用下面的占位句。重试按钮与加载文案在目录里还没有对应字段
// (commonLoadingText / commonRetryLabel 待后端补), 暂留占位并已列入
// 缺失字段清单。
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
  text: { fontFamily: fonts.serif, color: '#e08080', fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  loadingText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, textAlign: 'center', paddingHorizontal: 24 },
  btn: { borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  btnText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14, fontWeight: '600' },
});
