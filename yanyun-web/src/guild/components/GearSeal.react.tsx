/* Heirloom seal system (visual stamping from the original gear-planner-100,
 * sections 27/30):
 * - The verdict (isHeirloom/isDud) is computed server-side in gearplanner.js
 *   and delivered via gearEvals[].verdict; this module is visuals only: the
 *   gold plaque (.heirloom-seal) / grey plain seal (.dud-seal) / jade pendant
 *   tassel / gold-dust particles (click bursts + the 8-piece heirloom set
 *   celebration) and the celebration state machine.
 * - Styles live in src/index.css's heirloom-seal section (pseudo-element gold
 *   diamonds etc. can't be inlined).
 * - Labels come from the backend catalog gearVerdictHeirloom/gearVerdictDud,
 *   passed in by the caller. */

export function VerdictSeal({ verdict, heirloomLabel, dudLabel }: {
  verdict?: string | null;
  heirloomLabel: string;
  dudLabel: string;
}) {
  if (verdict === 'heirloom') return <span className="heirloom-seal">{heirloomLabel}</span>;
  if (verdict === 'dud') return <span className="dud-seal">{dudLabel}</span>;
  return null;
}

/* Jade pendant tassel (verbatim port of the original JADE_PENDANT_SVG): gold ring + red cord + green disc + red tassel */
export function JadePendant() {
  return (
    <span className="jade-pendant" aria-hidden="true">
      <svg viewBox="0 0 30 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="15" cy="5" r="3.4" fill="none" stroke="#C9A24B" strokeWidth="1.8" />
        <line x1="15" y1="8.4" x2="15" y2="11" stroke="#B02A20" strokeWidth="2" />
        <circle cx="15" cy="21" r="10.9" fill="none" stroke="rgba(201,162,75,.5)" strokeWidth=".9" />
        <circle cx="15" cy="21" r="8" fill="none" stroke="#57A773" strokeWidth="5.2" />
        <circle cx="15" cy="21" r="5.2" fill="none" stroke="#2E6B4A" strokeWidth=".9" />
        <rect x="11.4" y="31.5" width="7.2" height="5" rx="1.6" fill="#B02A20" />
        <path d="M10.5 37 L9 57 M13 37 L12.6 58 M15.5 37 L15.5 58.5 M18 37 L18.4 58 M20.5 37 L22 57" stroke="#C23A2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

/* ---------------- Gold dust particles (line-by-line port of the original goldDustBurst) ---------------- */
export const GOLD_DUST_COLORS = ['#F6DEA0', '#EFC96E', '#C9A24B', '#FFE9B0', '#D9A441'];

export function goldDustLayer(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  let layer = document.getElementById('goldDustLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'goldDustLayer';
    document.body.appendChild(layer);
  }
  return layer;
}

export function goldDustBurst(cx: number, cy: number, count = 24, spread = 90): number {
  const layer = goldDustLayer();
  if (!layer) return 0;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'gd-p';
    const sz = 2 + Math.random() * 3.6;
    p.style.width = sz.toFixed(1) + 'px';
    p.style.height = sz.toFixed(1) + 'px';
    p.style.background = GOLD_DUST_COLORS[i % GOLD_DUST_COLORS.length];
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
    layer.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = (0.3 + Math.random() * 0.7) * spread;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist * 0.7 + spread * 0.55;
    const rot = Math.round(Math.random() * 260 - 130);
    const dur = Math.round(560 + Math.random() * 300);
    const done = () => { if (p.parentNode) p.parentNode.removeChild(p); else if (p.remove) p.remove(); };
    let scheduled = false;
    if (typeof p.animate === 'function') {
      try {
        const an = p.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: `translate(calc(-50% + ${dx.toFixed(1)}px), calc(-50% + ${dy.toFixed(1)}px)) rotate(${rot}deg)`, opacity: 0 },
        ], { duration: dur, easing: 'cubic-bezier(.17,.67,.35,1)' });
        if (an) { an.onfinish = done; scheduled = true; }
      } catch { /* fall back to a timer when WAAPI is unavailable */ }
    }
    if (!scheduled) setTimeout(done, dur + 80);
  }
  return count;
}

/* Dust burst on clicking an heirloom card (the original
 * heirloomDustFromEvent): no burst when the click lands on an interactive
 * element. Callers attach this handler only on heirloom cards, so no
 * closest() lookup for the card is needed. */
const DUST_BLOCKED = new Set(['BUTTON', 'A', 'SELECT', 'INPUT', 'TEXTAREA', 'LABEL']);
export function heirloomDustFromClick(e: { target: EventTarget | null; clientX: number; clientY: number }): boolean {
  const t = e.target as HTMLElement | null;
  if (!t || !t.tagName) return false;
  if (DUST_BLOCKED.has(t.tagName)) return false;
  goldDustBurst(e.clientX || 0, e.clientY || 0, 24, 90);
  return true;
}

/* ---------------- Set-completion celebration state machine (the original heirloomParty) ----------------
 * `complete` records the last detected state; it fires only on the
 * incomplete -> complete transition (after a 400ms delay, a large burst from
 * the score element). Re-renders in the same complete state don't re-fire;
 * breaking the set and completing it again can. Loading the page already
 * complete also counts as a transition. */
export type HeirloomParty = {
  readonly complete: boolean;
  readonly fires: number;
  check: (completeNow: boolean, fire: () => void) => boolean;
};

export function createHeirloomParty(): HeirloomParty {
  const st = { complete: false, fires: 0 };
  return {
    get complete() { return st.complete; },
    get fires() { return st.fires; },
    check(completeNow: boolean, fire: () => void) {
      const shouldFire = completeNow && !st.complete;
      st.complete = completeNow;
      if (shouldFire) {
        st.fires++;
        setTimeout(fire, 400);
      }
      return shouldFire;
    },
  };
}

/* Celebration burst (the original fireHeirloomParty): 110 + 50 particles from the center of the graduation-score element */
export function fireHeirloomCelebration(el: HTMLElement | null): void {
  let cx = 400;
  let cy = 140;
  if (el && el.getBoundingClientRect) {
    const r = el.getBoundingClientRect();
    if (r) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  } else if (typeof window !== 'undefined' && window.innerWidth) {
    cx = window.innerWidth / 2;
  }
  goldDustBurst(cx, cy, 110, 300);
  goldDustBurst(cx, cy, 50, 170);
}
