
type NotificationCentreProps = {
  onBack: () => void;
};

export default function NotificationCentre({
  onBack,
}: NotificationCentreProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050A30",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            backgroundColor: "#FBC713",
            color: "#050A30",
            border: "none",
            borderRadius: "8px",
            padding: "12px 18px",
            fontWeight: "bold",
            cursor: "pointer",
            marginBottom: "25px",
          }}
        >
          ← Back to Dashboard
        </button>

        <h1 style={{ fontSize: "28px" }}>
          🔔 Notifications
        </h1>

        <p style={{ opacity: 0.75 }}>
          Stay connected with your NEXT01 updates.
        </p>

        <section
          style={{
            backgroundColor: "#FFFFFF",
            color: "#050A30",
            borderRadius: "14px",
            padding: "24px",
            marginTop: "25px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "42px" }}>
            🔔
          </div>

          <h2 style={{ fontSize: "22px" }}>
            You're All Caught Up!
          </h2>

          <p
            style={{
              color: "#64748B",
              lineHeight: 1.6,
            }}
          >
            You don't have any notifications yet.
            Important updates, new opportunities,
            and announcements will appear here.
          </p>
        </section>
      </div>
    </main>
  );
}
