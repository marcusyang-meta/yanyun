import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.react.tsx'

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
