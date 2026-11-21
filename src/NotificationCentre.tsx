
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";

type NotificationCentreProps = {
  onBack: () => void;
};

type NextNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Timestamp | null;
};

export default function NotificationCentre({
  onBack,
}: NotificationCentreProps) {
  const [notifications, setNotifications] = useState<
    NextNotification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(
    null
  );
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setError("Please sign in to view notifications.");
      setLoading(false);
      return;
    }

    const notificationsRef = collection(
      db,
      "users",
      user.uid,
      "notifications"
    );

    const unsubscribe = onSnapshot(
      notificationsRef,
      (snapshot) => {
        const items: NextNotification[] =
          snapshot.docs.map((document) => {
            const data = document.data();

            return {
              id: document.id,
              title:
                typeof data.title === "string"
                  ? data.title
                  : "NEXT01 Update",
              message:
                typeof data.message === "string"
                  ? data.message
                  : "",
              isRead: data.isRead === true,
              createdAt: data.createdAt ?? null,
            };
          });

        items.sort((a, b) => {
          const aTime = a.createdAt?.toMillis() ?? 0;
          const bTime = b.createdAt?.toMillis() ?? 0;
          return bTime - aTime;
        });

        setNotifications(items);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        console.error(
          "Notification loading failed:",
          snapshotError
        );
        setError("Unable to load notifications.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    const user = auth.currentUser;

    if (!user || markingAll || updatingId !== null) return;

    setUpdatingId(notificationId);
    setError("");

    try {
      const notificationRef = doc(
        db,
        "users",
        user.uid,
        "notifications",
        notificationId
      );

      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp(),
      });
    } catch (updateError) {
      console.error(
        "Failed to mark notification as read:",
        updateError
      );
      setError("Unable to mark notification as read.");
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsRead = async () => {
    const user = auth.currentUser;

    if (!user || markingAll || updatingId !== null) return;

    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    );

    if (unreadNotifications.length === 0) return;

    setMarkingAll(true);
    setError("");

    try {
      // Firestore batches support up to 500 writes.
      // Use smaller batches to stay within safe limits.
      const batchSize = 400;

      for (
        let start = 0;
        start < unreadNotifications.length;
        start += batchSize
      ) {
        const batch = writeBatch(db);
        const currentGroup = unreadNotifications.slice(
          start,
          start + batchSize
        );

        for (const notification of currentGroup) {
          const notificationRef = doc(
            db,
            "users",
            user.uid,
            "notifications",
            notification.id
          );

          batch.update(notificationRef, {
            isRead: true,
            readAt: serverTimestamp(),
          });
        }

        await batch.commit();
      }
    } catch (updateError) {
      console.error(
        "Failed to mark all notifications as read:",
        updateError
      );
      setError(
        "Unable to mark all notifications as read. Please try again."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const isUpdating = markingAll || updatingId !== null;

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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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

        {!loading && !error && unreadCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <p
              style={{
                color: "#FBC713",
                margin: 0,
              }}
            >
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={isUpdating}
              style={{
                backgroundColor: "#FBC713",
                color: "#050A30",
                border: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: isUpdating ? "wait" : "pointer",
                opacity: isUpdating ? 0.65 : 1,
              }}
            >
              {markingAll
                ? "Marking All..."
                : "✓ Mark All as Read"}
            </button>
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{
              backgroundColor: "#FEE2E2",
              color: "#991B1B",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            {error}
          </p>
        )}

        {loading ? (
          <p role="status">Loading notifications...</p>
        ) : notifications.length === 0 && !error ? (
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
            <div style={{ fontSize: "42px" }}>🔔</div>

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
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
              marginTop: "25px",
            }}
          >
            {notifications.map((notification) => (
              <article
                key={notification.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "#050A30",
                  borderRadius: "14px",
                  padding: "20px",
                  borderLeft: notification.isRead
                    ? "5px solid #CBD5E1"
                    : "5px solid #FBC713",
                }}
              >
                <h2 style={{ fontSize: "19px" }}>
                  {notification.isRead ? "✓" : "🔔"}{" "}
                  {notification.title}
                </h2>

                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  {notification.message}
                </p>

                {notification.createdAt && (
                  <p
                    style={{
                      color: "#64748B",
                      fontSize: "12px",
                    }}
                  >
                    {notification.createdAt
                      .toDate()
                      .toLocaleString()}
                  </p>
                )}

                {!notification.isRead && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                    style={{
                      backgroundColor: "#FBC713",
                      color: "#050A30",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontWeight: "bold",
                      cursor: isUpdating ? "wait" : "pointer",
                      opacity: isUpdating ? 0.65 : 1,
                    }}
                  >
                    {updatingId === notification.id
                      ? "Updating..."
                      : "Mark as Read"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
