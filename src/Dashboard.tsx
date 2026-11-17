
import { useState } from "react";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import PublicOpinion from "./PublicOpinion";
import PollDirectory from "./PollDirectory";


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
          <h1 style={{ fontSize: "28px" }}>
            Welcome,{" "}
            {profile.fullName ||
              user.displayName ||
              "User"}!
          </h1>

          <p style={{ opacity: 0.75 }}>
            Your Digital Lifestyle Starts Here.
          </p>
        </section>

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
              <span style={{ fontSize: "30px" }}>
                {module.icon}
              </span>

              <span style={{ fontWeight: "bold" }}>
                {module.name}
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
