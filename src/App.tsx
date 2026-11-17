import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { User } from "firebase/auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import Dashboard from "./Dashboard";
import { auth, db } from "./firebase";

type Profile = {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  occupation: string;
};

const emptyProfile: Profile = {
  fullName: "",
  dateOfBirth: "",
  mobileNumber: "",
  occupation: "",
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "13px",
  borderRadius: "8px",
  border: "1px solid #CCCCCC",
  boxSizing: "border-box",
  fontSize: "15px",
  marginTop: "6px",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savedProfile, setSavedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      const thisRequest = ++requestId;
      setLoading(true);
      setUser(currentUser);
      setMessage("");
      setShowDashboard(false);
      setSavedProfile(null);

      if (!currentUser) {
        setProfile(emptyProfile);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", currentUser.uid));
        if (!active || thisRequest !== requestId) return;

        if (snapshot.exists()) {
          const data = snapshot.data();
          const loadedProfile: Profile = {
            fullName: typeof data.fullName === "string" ? data.fullName : "",
            dateOfBirth: typeof data.dateOfBirth === "string" ? data.dateOfBirth : "",
            mobileNumber: typeof data.mobileNumber === "string" ? data.mobileNumber : "",
            occupation: typeof data.occupation === "string" ? data.occupation : "",
          };
          setProfile(loadedProfile);
          setSavedProfile(loadedProfile);
          setShowDashboard(Boolean(loadedProfile.fullName.trim()));
        } else {
          setProfile({ ...emptyProfile, fullName: currentUser.displayName || "" });
        }
      } catch (error) {
        if (!active || thisRequest !== requestId) return;
        console.error("Profile loading error:", error);
        setMessage("Could not load your profile. Please try again.");
      } finally {
        if (active && thisRequest === requestId) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setMessage("");
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Google Login Error:", error);
      setMessage("Google Login failed. Please try again.");
    }
  };

  const handleSaveProfile = async () => {
    if (!user || saving) return;
    const fullName = profile.fullName.trim();
    const mobileNumber = profile.mobileNumber.trim();
    const occupation = profile.occupation.trim();

    if (!fullName) {
      setMessage("Please enter your full name.");
      return;
    }
    if (profile.dateOfBirth && (profile.dateOfBirth > new Date().toLocaleDateString("en-CA") || !/^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth))) {
      setMessage("Please enter a valid date of birth.");
      return;
    }
    if (mobileNumber && !/^\+?[0-9\s-]{7,20}$/.test(mobileNumber)) {
      setMessage("Please enter a valid mobile number.");
      return;
    }

    setSaving(true);
    setMessage("");
    const profileData: Profile = {
      fullName,
      dateOfBirth: profile.dateOfBirth,
      mobileNumber,
      occupation,
    };

    try {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        await updateDoc(userRef, {
          ...profileData,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || "",
          email: user.email || "",
          photoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          ...profileData,
        });
      }
      setProfile(profileData);
      setSavedProfile(profileData);
      setMessage("Profile saved successfully!");
    } catch (error) {
      console.error("Profile save error:", error);
      setMessage("Unable to save profile. Check Firestore Rules and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    if (!savedProfile?.fullName.trim()) return;
    setProfile(savedProfile); // Discard edits not saved to Firestore.
    setMessage("");
    setShowDashboard(true);
  };

  const handleLogout = async () => {
    try {
      setMessage("");
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("Logout failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#050A30", color: "white", display: "grid", placeItems: "center" }}>
        Loading NEXT01...
      </main>
    );
  }

  if (user && showDashboard && savedProfile) {
    return (
      <Dashboard
        user={user}
        profile={savedProfile}
        onEditProfile={() => {
          setProfile(savedProfile);
          setMessage("");
          setShowDashboard(false);
        }}
      />
    );
  }

  return (
    <main style={{
      minHeight: "100vh", backgroundColor: "#050A30", color: "#FFFFFF",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "48px 20px", fontFamily: "Arial, sans-serif", boxSizing: "border-box",
    }}>
      <img src="/next01-logo.png" alt="NEXT01 Official Logo" style={{ width: "min(300px, 80vw)", marginBottom: "30px" }} />

      {!user ? (
        <section style={{ textAlign: "center" }}>
          <h2>Welcome to NEXT 01</h2>
          <p>Your Digital Lifestyle Starts Here.</p>
          <button type="button" onClick={handleGoogleLogin} style={{ ...buttonStyle, width: "auto", padding: "14px 25px", background: "white", color: "#050A30", border: "none", marginTop: "20px" }}>
            Continue with Google
          </button>
        </section>
      ) : (
        <section style={{ width: "100%", maxWidth: "440px", backgroundColor: "#FFFFFF", color: "#050A30", padding: "28px", borderRadius: "16px", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center" }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" style={{ width: "72px", height: "72px", borderRadius: "50%" }} />
            )}
            <h2>{savedProfile ? "Edit Your Profile" : "Complete Your Profile"}</h2>
            <p>{user.email}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "25px" }}>
            <label>
              Full Name
              <input style={inputStyle} value={profile.fullName} maxLength={120} onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))} />
            </label>
            <label>
              Date of Birth
              <input type="date" style={inputStyle} max={new Date().toLocaleDateString("en-CA")} value={profile.dateOfBirth} onChange={(e) => setProfile((p) => ({ ...p, dateOfBirth: e.target.value }))} />
            </label>
            <label>
              Mobile Number
              <input type="tel" style={inputStyle} maxLength={20} placeholder="+947XXXXXXXX" value={profile.mobileNumber} onChange={(e) => setProfile((p) => ({ ...p, mobileNumber: e.target.value }))} />
            </label>
            <label>
              Occupation / Status
              <select style={inputStyle} value={profile.occupation} onChange={(e) => setProfile((p) => ({ ...p, occupation: e.target.value }))}>
                <option value="">Select your status</option>
                <option value="School Student">School Student</option>
                <option value="University Student">University Student</option>
                <option value="Employee">Employee</option>
                <option value="Self Employed">Self Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <button type="button" onClick={handleSaveProfile} disabled={saving} style={{ ...buttonStyle, backgroundColor: "#FBC713", color: "#050A30", border: "none", cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Saving..." : "Save My Profile"}
            </button>
            {savedProfile?.fullName.trim() && (
              <button type="button" onClick={handleBackToDashboard} disabled={saving} style={{ ...buttonStyle, backgroundColor: "#FFFFFF", color: "#050A30", border: "1px solid #050A30" }}>
                ← Back to Dashboard
              </button>
            )}
            <button type="button" onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: "#050A30", color: "#FFFFFF", border: "none" }}>
              Logout
            </button>
          </div>
        </section>
      )}

      {message && (
        <p role="status" style={{ color: message.includes("successfully") ? "#FBC713" : "#FFAAAA", textAlign: "center", marginTop: "20px" }}>
          {message}
        </p>
      )}
      <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "40px", textAlign: "center" }}>
        Powered by UDB Corporation (Pvt) Ltd.
      </p>
    </main>
  );
}

export default App;
