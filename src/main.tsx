import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function showRuntimeError(title: string, detail: unknown) {
  if (!import.meta.env.DEV) {
    console.error(title, detail);
    return;
  }

  const root = document.getElementById('root');
  if (!root) return;

  let message = '';

  if (detail instanceof Error) {
    message = detail.stack || detail.message;
  } else {
    message = String(detail);
  }

  let panel = document.getElementById('runtime-diagnostic');

  if (!panel) {
    panel = document.createElement('pre');
    panel.id = 'runtime-diagnostic';
    panel.style.cssText =
      'position:fixed;inset:0;z-index:999999;background:#fff;color:#b00020;padding:20px;overflow:auto;white-space:pre-wrap;font:14px monospace;';
    document.body.appendChild(panel);
  }

  panel.textContent = `${title}\n\n${message}`;
}

window.addEventListener('error', (event) => {
  showRuntimeError('JAVASCRIPT ERROR', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  showRuntimeError('UNHANDLED PROMISE REJECTION', event.reason);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  showRuntimeError('STARTUP ERROR', 'The #root element was not found.');
} else {
  ReactDOM.createRoot(rootElement).render(<App />);
}
