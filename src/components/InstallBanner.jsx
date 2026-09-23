import { useEffect, useState } from "react";
import { DownloadIcon } from "./Icons";
import "./PWAStatus.css";

const DISMISS_KEY = "photoreel-install-dismissed";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // iOS Safari has no beforeinstallprompt — show a manual hint instead
    let iosTimer;
    if (isIOS()) {
      iosTimer = setTimeout(() => {
        setShowIOSHint(true);
        setVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className="pwa-install-banner" role="dialog" aria-label="Install app">
      <div className="pwa-install-text">
        <strong>I-install ang Photoreel</strong>
        <span>
          {showIOSHint
            ? 'Tap Share, then "Add to Home Screen" para gumana offline sa event.'
            : "Idagdag sa home screen — mas mabilis at gumagana kahit walang internet sa event."}
        </span>
      </div>
      <div className="pwa-install-actions">
        {!showIOSHint && (
          <button
            type="button"
            className="pwa-install-btn"
            onClick={handleInstall}
          >
            <DownloadIcon /> Install
          </button>
        )}
        <button
          type="button"
          className="pwa-install-dismiss"
          onClick={dismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
