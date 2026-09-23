import useOnlineStatus from "../hooks/useOnlineStatus";
import "./PWAStatus.css";

export default function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <span
      className="offline-badge"
      title="Walang internet — gumagana pa rin ang booth"
    >
      <span className="offline-dot" aria-hidden="true" /> Offline
    </span>
  );
}
