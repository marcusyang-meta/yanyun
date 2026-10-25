/* 传家宝印章系统 (原站 gear-planner-100 第 27/30 节的视觉盖章):
 * - 判定 (isHeirloom/isDud) 在服务端 gearplanner.js, 经 gearEvals[].verdict 下发;
 *   本模块只负责视觉: 金漆牌 (.heirloom-seal) / 灰素印 (.dud-seal) / 玉佩挂穗 /
 *   金粉粒子 (点击撒粉 + 集齐 8 件传家宝庆祝) 与庆祝状态机。
 * - 样式在 src/index.css 的「传家宝印章」段 (伪元素金菱等无法 inline)。
 * - 文案 (传家宝/拉完了) 走后端目录 gearVerdictHeirloom/gearVerdictDud, 由调用方传入。 */

export function VerdictSeal({ verdict, heirloomLabel, dudLabel }: {
  verdict?: string | null;
  heirloomLabel: string;
  dudLabel: string;
}) {
  if (verdict === 'heirloom') return <span className="heirloom-seal">{heirloomLabel}</span>;
  if (verdict === 'dud') return <span className="dud-seal">{dudLabel}</span>;
  return null;
}

/* 玉佩挂穗 (原站 JADE_PENDANT_SVG 逐字移植): 金环 + 红绳 + 绿璧 + 红穗 */
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

/* ---------------- 金粉粒子 (原站 goldDustBurst 逐行对照) ---------------- */
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
      } catch { /* WAAPI 不可用时走定时兜底 */ }
    }
    if (!scheduled) setTimeout(done, dur + 80);
  }
  return count;
}

/* 点击传家宝卡撒粉 (原站 heirloomDustFromEvent): 点在交互元素上不撒。
 * 调用方只在 heirloom 卡上挂此 handler, 故不再需要 closest 找卡。 */
const DUST_BLOCKED = new Set(['BUTTON', 'A', 'SELECT', 'INPUT', 'TEXTAREA', 'LABEL']);
export function heirloomDustFromClick(e: { target: EventTarget | null; clientX: number; clientY: number }): boolean {
  const t = e.target as HTMLElement | null;
  if (!t || !t.tagName) return false;
  if (DUST_BLOCKED.has(t.tagName)) return false;
  goldDustBurst(e.clientX || 0, e.clientY || 0, 24, 90);
  return true;
}

/* ---------------- 集齐庆祝状态机 (原站 heirloomParty) ----------------
 * complete 记录上次检出状态; 仅在 未齐 -> 集齐 的跃迁时触发一次
 * (延迟 400ms 后从分数元素撒大粉), 同一集齐状态重渲染不重复,
 * 破齐后再集齐可再触发。页面载入时已集齐也算一次跃迁。 */
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

/* 庆祝撒粉 (原站 fireHeirloomParty): 从毕业度分数元素中心撒 110 + 50 粒 */
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
