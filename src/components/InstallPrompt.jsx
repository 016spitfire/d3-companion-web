import { useState, useEffect } from 'react';
import { FaMobileAlt, FaTimes } from 'react-icons/fa';

const DISMISSED_KEY = 'd3companion-install-dismissed';

// Rendered as a normal in-flow flex child in App.jsx (not position: fixed) so
// it slides BottomNav up rather than floating on top of it on mobile.
const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');
    if (isStandalone) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // iOS Safari never fires beforeinstallprompt at all, so it'd otherwise
    // never show the banner — give it a few seconds, then show anyway with
    // manual instructions instead of a native install trigger. Re-checks the
    // dismissed flag at fire time, not just on mount, so dismissing within
    // that window doesn't get silently overridden when the timer lands.
    const fallbackTimer = setTimeout(() => {
      if (!localStorage.getItem(DISMISSED_KEY)) setShowPrompt(true);
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowIosHelp(true);
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!showPrompt) return null;

  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 16px',
        backgroundColor: '#16080a',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <FaMobileAlt size={20} style={{ color: 'var(--gold-bright)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: '700', color: 'var(--text)' }}>
            Install D3 Companion
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Add to your home screen for quicker access and offline use
          </span>
        </div>
        <button
          onClick={handleInstallClick}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            backgroundColor: 'var(--red)',
            borderRadius: 'var(--r-md)',
            color: 'white',
            fontSize: 12,
            fontWeight: '700',
          }}
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <FaTimes size={14} />
        </button>
      </div>

      {showIosHelp && (
        <div style={{
          fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5,
          backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-md)', padding: '10px 12px',
        }}>
          <strong style={{ color: 'var(--text)' }}>iOS Safari:</strong> tap the Share icon, then "Add to Home Screen."<br />
          <strong style={{ color: 'var(--text)' }}>Android Chrome:</strong> tap the menu (⋮), then "Add to Home screen" or "Install app."
        </div>
      )}
    </div>
  );
};

export default InstallPrompt;
