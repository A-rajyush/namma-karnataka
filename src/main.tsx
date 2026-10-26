import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

// Tier 1: Global JS / Fetch Interceptor for Google Maps Demo Key Quota Protection
try {
  window.gm_authFailure = () => {
    window.dispatchEvent(new CustomEvent('gmp-quota-error'));
  };
} catch {
  // Ignore if gm_authFailure is read-only
}

window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('OverQuotaMapError') || e.message.includes('QuotaExceeded'))) {
    window.dispatchEvent(new CustomEvent('gmp-quota-error'));
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const reason = String(e.reason || '');
  if (reason.includes('OverQuotaMapError') || reason.includes('QuotaExceeded') || reason.includes('OVER_QUERY_LIMIT')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-error'));
  }
});

try {
  const origFetch = window.fetch.bind(window);
  const wrappedFetch: typeof window.fetch = async (...args) => {
    const response = await origFetch(...args);
    const url = typeof args[0] === 'string' ? args[0] : (args[0] instanceof Request ? args[0].url : '');
    if (url.includes('googleapis.com')) {
      if (response.status === 429 || response.status === 403) {
        window.dispatchEvent(new CustomEvent('gmp-quota-error'));
      } else if (!response.ok) {
        const clone = response.clone();
        clone.text().then(text => {
          if (text.includes('RESOURCE_EXHAUSTED') || text.includes('OVER_QUERY_LIMIT') || text.includes('OverQuota')) {
            window.dispatchEvent(new CustomEvent('gmp-quota-error'));
          }
        }).catch(() => {});
      }
    }
    return response;
  };

  Object.defineProperty(window, 'fetch', {
    value: wrappedFetch,
    configurable: true,
    writable: true,
  });
} catch {
  // In sandboxed iframe environments where window.fetch is non-configurable getter-only, rely on gm_authFailure and error listeners
}

createRoot(document.getElementById('root')!).render(<App />);

