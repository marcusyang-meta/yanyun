import { useEffect, useState } from 'react';

// 移动宽度判定 (<=640px, 与 index.css 的媒体查询同一断点)。
// 用于呈现层切换: 桌面浮层类表面在移动端改为 pushPage 全屏推页。
const QUERY = '(max-width: 640px)';

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(QUERY).matches
      : false,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(QUERY);
    const fn = (e: MediaQueryListEvent) => setMobile(e.matches);
    setMobile(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', fn);
      return () => mq.removeEventListener('change', fn);
    }
    // 老式 Safari 的 MediaQueryList 只有 addListener
    (mq as any).addListener(fn);
    return () => { (mq as any).removeListener(fn); };
  }, []);
  return mobile;
}
