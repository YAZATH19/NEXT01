
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("PWA registration error:", error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 420,
        margin: "0 auto",
        padding: 20,
        background: "#050A30",
        color: "#FFFFFF",
        border: "1px solid #FBC713",
        borderRadius: 12,
        boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
        zIndex: 9999,
      }}
    >
      <strong>NEXT01 Update Available</strong>

      <p>
        A new version of NEXT01 is ready.
        Update when convenient.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          onClick={() => {
  console.log("NEXT01: Update Now clicked");
  void updateServiceWorker(true);
}}
          style={{
            padding: "10px 16px",
            background: "#FBC713",
            color: "#050A30",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Update Now
        </button>

        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          style={{
            padding: "10px 16px",
            background: "transparent",
            color: "#FFFFFF",
            border: "1px solid #FFFFFF",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
