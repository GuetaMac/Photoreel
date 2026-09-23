import { useRegisterSW } from "virtual:pwa-register/react";
import "./PWAStatus.css";

export default function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) return null;

  return (
    <div className="pwa-toast" role="status">
      <span>
        {needRefresh
          ? "May bagong update ang Photoreel."
          : "Handa na — gagana kahit walang internet."}
      </span>
      <div className="pwa-toast-actions">
        {needRefresh && (
          <button
            type="button"
            className="pwa-toast-btn"
            onClick={() => updateServiceWorker(true)}
          >
            I-update
          </button>
        )}
        <button
          type="button"
          className="pwa-toast-dismiss"
          onClick={close}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
