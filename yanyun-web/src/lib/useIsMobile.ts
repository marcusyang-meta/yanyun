import { useEffect, useState } from 'react';

// Mobile-width check (<=640px — the same breakpoint as index.css's media
// query). Drives presentation switching: desktop overlay-style surfaces
// become full-screen push pages on mobile.
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
    // Legacy Safari's MediaQueryList only has addListener
    (mq as any).addListener(fn);
    return () => { (mq as any).removeListener(fn); };
  }, []);
  return mobile;
}
