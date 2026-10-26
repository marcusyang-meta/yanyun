import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { theme } from '../../lib/format';

let pushToast: ((msg: string, ms?: number) => void) | null = null;
export function toast(msg: string, ms = 2500) {
  if (pushToast) pushToast(msg, ms);
}

export function ToastHost() {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);

  useEffect(() => {
    let nextId = 1;
    pushToast = (msg: string, ms = 2500) => {
      const id = nextId++;
      setItems((prev) => [...prev, { id, msg }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, ms);
    };
    return () => { pushToast = null; };
  }, []);

  if (!items.length) return null;
  return createPortal(
    <div style={{
      position: 'fixed', left: '50%', bottom: 80, transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
      pointerEvents: 'none', maxWidth: '90vw',
    }}>
      {items.map((t) => (
        <div key={t.id} style={{
          background: '#1a1814', border: `1px solid ${theme.gold}`, color: theme.paper,
          padding: '12px 20px', borderRadius: 10, fontSize: 14, textAlign: 'center',
        }}>
          {t.msg}
        </div>
      ))}
    </div>,
    document.body
  );
}

// Custom confirm dialog (replaces the system confirm); portaled to body, centered on desktop and mobile
export function ConfirmDialog({ title, message, onOk, onCancel, okLabel, cancelLabel }: {
  title: string; message: string; onOk: () => void; onCancel: () => void;
  okLabel: string; cancelLabel: string;
}) {
  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 9998,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onCancel}>
      <div style={{
        background: '#1a1814', border: `1px solid ${theme.gold}`, borderRadius: 12,
        padding: 24, maxWidth: 360, width: '100%', maxHeight: '85vh', overflowY: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 18, color: theme.goldHi, marginBottom: 12 }}>{title}</div>
        <div style={{ color: theme.paper, fontSize: 14, marginBottom: 20 }}>{message}</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.paper,
          }}>{cancelLabel}</button>
          <button onClick={onOk} style={{
            padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
            background: theme.gold, border: 'none', color: '#1a1814', fontWeight: 600,
          }}>{okLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
