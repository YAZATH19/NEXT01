import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import PublicOpinion from "./PublicOpinion";
import PollDirectory from "./PollDirectory";
import QuizCentre from "./QuizCentre";
import NotificationCentre from "./NotificationCentre";


type Profile = {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  occupation: string;
};

type DashboardProps = {
  user: User;
  profile: Profile;
  onEditProfile: () => void;
};

const modules = [
  { name: "Public Opinion", icon: "📊" },
  { name: "Quiz Centre", icon: "🧠" },
  { name: "Surveys", icon: "📝" },
  { name: "Merchant Offers", icon: "🏷️" },
  { name: "My Profile", icon: "👤" },
  { name: "Notifications", icon: "🔔" },
];

export default function Dashboard({
  user,
  profile,
  onEditProfile,
}: DashboardProps) {
  const [selectedModule, setSelectedModule] = useState("");
 
const [showPublicOpinion, setShowPublicOpinion] =
  useState(false);

const [selectedPollId, setSelectedPollId] =
  useState<string | null>(null);

  const [loggingOut, setLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!user.uid) {
    setUnreadCount(0);
    return;
  }

  const notificationsQuery = query(
    collection(db, "users", user.uid, "notifications"),
    where("isRead", "==", false)
  );

  const unsubscribe = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      setUnreadCount(snapshot.size);
    },
    (error) => {
      console.error("Unread notifications error:", error);
      setUnreadCount(0);
    }
  );

  return () => unsubscribe();
}, [user.uid]);
    const profileFields = [
    profile.fullName,
    profile.dateOfBirth,
    profile.mobileNumber,
    profile.occupation,
  ];

  const completedFields = profileFields.filter(
    (value) => value.trim().length > 0
  ).length;

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100
  );

  const handleModuleClick = (name: string) => {
    if (name === "My Profile") {
      onEditProfile();
      return;
    }

    
if (name === "Public Opinion") {
  setSelectedModule("");
  setSelectedPollId(null);
  setShowPublicOpinion(true);
  return;
}
if (name === "Quiz Centre") {
  setSelectedModule("Quiz Centre");
  return;
}
    setSelectedModule(name);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please try again.");
      setLoggingOut(false);
    }
  };

  if (selectedModule === "Quiz Centre") {
  return (
    <QuizCentre
      onBack={() => setSelectedModule("")}
    />
  );
}
  if (selectedModule === "Notifications") {
    return (
      <NotificationCentre
        onBack={() => setSelectedModule("")}
      />
    );
  }
if (showPublicOpinion) {
  if (selectedPollId !== null) {
    return (
      <PublicOpinion
        key={selectedPollId}
        pollId={selectedPollId}
        onBack={() => setSelectedPollId(null)}
      />
    );
  }

  return (
    <PollDirectory
      onSelectPoll={(pollId) =>
        setSelectedPollId(pollId)
      }
      onBack={() => {
        setSelectedPollId(null);
        setShowPublicOpinion(false);
      }}
    />
  );
}

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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "15px",
            marginBottom: "40px",
          }}
        >
          <img
            src="/next01-logo.png"
            alt="NEXT01"
            style={{
              width: "140px",
              maxWidth: "45%",
              height: "auto",
              objectFit: "contain",
            }}
          />

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              backgroundColor: "#FFFFFF",
              color: "#050A30",
              border: "none",
              borderRadius: "8px",
              padding: "12px 18px",
              cursor: loggingOut ? "wait" : "pointer",
              fontWeight: "bold",
            }}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <section style={{ marginBottom: "30px" }}>
           <h1
            style={{
              fontSize: "28px",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span>
              Welcome,{" "}
              {profile.fullName ||
                user.displayName ||
                "User"}!
            </span>

            {profileCompletion === 100 && (
              <span
                role="img"
                aria-label="Profile Complete"
                title="NEXT01 Gold Profile Completion Badge"
                style={{
                  color: "#FBC713",
                  fontSize: "27px",
                  lineHeight: 1,
                }}
              >
                                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3 14.7 4.6 17.8 4.7 19.4 7.3 22 9 21.3 12 22 15 19.4 16.7 17.8 19.3 14.7 19.4 12 21 9.3 19.4 6.2 19.3 4.6 16.7 2 15 2.7 12 2 9 4.6 7.3 6.2 4.7 9.3 4.6Z" />
                  <path d="m8.5 12 2.5 2.5 4.5-5" />
                </svg>
              </span>
            )}
          </h1>

          <p style={{ opacity: 0.75 }}>
            Your Digital Lifestyle Starts Here.
          </p>
        </section>
                {profileCompletion < 100 && (
                <section
          style={{
            backgroundColor: "#FFFFFF",
            color: "#050A30",
            padding: "20px",
            borderRadius: "14px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Profile Completion
            </h3>

            <strong style={{ color: "#2563EB" }}>
              {profileCompletion}%
            </strong>
          </div>

          <div
            role="progressbar"
            aria-label="Profile completion"
            aria-valuenow={profileCompletion}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              width: "100%",
              height: "10px",
              backgroundColor: "#E5E7EB",
              borderRadius: "10px",
              overflow: "hidden",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                width: `${profileCompletion}%`,
                height: "100%",
                backgroundColor: "#2563EB",
                borderRadius: "10px",
              }}
            />
          </div>

          <p style={{ fontSize: "14px", marginTop: "12px" }}>
            {profileCompletion === 100
              ? "Your profile is complete!"
              : "Complete your profile to get the most out of NEXT01."}
          </p>

          {profileCompletion < 100 && (
            <button
              type="button"
              onClick={onEditProfile}
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Complete My Profile
            </button>
          )}
        </section>
                )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "15px",
            marginBottom: "35px",
          }}
        >
          {[
            {
              title: "NEXT POINTS",
              value: "0",
              icon: "🪙",
            },
            {
              title: "My Rewards",
              value: "0",
              icon: "🎁",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: "#FFFFFF",
                color: "#050A30",
                borderRadius: "12px",
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: "24px" }}>
                {item.icon}
              </div>

              <p style={{ fontSize: "13px" }}>
                {item.title}
              </p>

              <strong style={{ fontSize: "30px" }}>
                {item.value}
              </strong>
            </div>
          ))}
        </div>

        <h2 style={{ marginBottom: "20px" }}>
          Explore NEXT01
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",
            gap: "15px",
          }}
        >
          {modules.map((module) => (
            <button
              key={module.name}
              type="button"
              onClick={() =>
                handleModuleClick(module.name)
                
              }
              style={{
                backgroundColor: "#19234C",
                color: "#FFFFFF",
                border: "1px solid #303A69",
                borderRadius: "12px",
                padding: "25px 10px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
  style={{
    fontSize: "30px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }}
>
  {module.name === "My Profile" ? (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#38BDF8"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </svg>
  ) : (
    module.icon
  )}
</span>
   
<span
  style={{
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "8px",
  }}
>
  {module.name}

  {module.name === "Notifications" && unreadCount > 0 && (
    <span
      aria-label={`${unreadCount} unread notifications`}
      style={{
        backgroundColor: "#FBC713",
        color: "#050A30",
        borderRadius: "999px",
        padding: "3px 8px",
        fontSize: "12px",
        fontWeight: "bold",
        minWidth: "20px",
        textAlign: "center",
      }}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</span>      
            </button>
          ))}
        </div>

        {selectedModule && (
          <div
            role="status"
            style={{
              backgroundColor: "#19234C",
              border: "1px solid #FBC713",
              padding: "20px",
              borderRadius: "12px",
              marginTop: "25px",
            }}
          >
            <h3>{selectedModule}</h3>

            <p>
              This NEXT01 module is under development.
            </p>

            <button
              type="button"
              onClick={() => setSelectedModule("")}
              style={{
                backgroundColor: "#FBC713",
                color: "#050A30",
                border: "none",
                borderRadius: "6px",
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Close
            </button>
          </div>
        )}

        <footer
          style={{
            textAlign: "center",
            marginTop: "50px",
            fontSize: "12px",
            opacity: 0.6,
          }}
        >
          Powered by UDB Corporation (Pvt) Ltd.
        </footer>
      </div>
    </main>
  );
}
