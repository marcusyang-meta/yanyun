import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.react.tsx'
import { applyMirroredTheme } from './lib/theme'

// Apply the mirrored account theme before the first render (index.html
// already ran the same logic inline before first paint; this covers
// any entry path that bypasses that script). AppRoot reconciles the
// mirror against the server's myThemePref once the viewer query lands.
applyMirroredTheme();

const el = document.getElementById('root');
if (!el) {
  document.body.innerHTML = '<div style="color:red;padding:40px">NO #root</div>';
} else {
  try {
    createRoot(el).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (e: any) {
    document.body.innerHTML = '<pre style="color:red;padding:20px">MOUNT: ' + String(e?.stack || e) + '</pre>';
  }
}
