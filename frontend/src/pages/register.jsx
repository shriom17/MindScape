import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, getUser, supabase } from "../services/supabaseClient";
import heroImage from "../assets/loginbg.png";

const LOGIN_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 5;
const LOGIN_RATE_LIMIT_KEY = "mindscape_login_attempts";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signup");

  const readLoginAttempts = () => {
    try {
      const raw = localStorage.getItem(LOGIN_RATE_LIMIT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((ts) => typeof ts === "number" && !Number.isNaN(ts));
    } catch (e) {
      return [];
    }
  };

  const writeLoginAttempts = (attempts) => {
    try {
      localStorage.setItem(LOGIN_RATE_LIMIT_KEY, JSON.stringify(attempts));
    } catch (e) {
      // ignore storage errors
    }
  };

  const pruneLoginAttempts = (attempts, nowMs) => {
    return attempts.filter((ts) => nowMs - ts < LOGIN_RATE_LIMIT_WINDOW_MS);
  };

  const getRetryAfterSeconds = (attempts, nowMs) => {
    if (attempts.length < LOGIN_RATE_LIMIT_MAX) return 0;
    const oldest = Math.min(...attempts);
    const waitMs = LOGIN_RATE_LIMIT_WINDOW_MS - (nowMs - oldest);
    return Math.max(1, Math.ceil(waitMs / 1000));
  };

  useEffect(() => {
    let mounted = true;
    ;(async () => {
      try {
        const user = await getUser();
        if (mounted && user?.id) {
          navigate('/');
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const calculateAge = (dobStr) => {
    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) return NaN;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!name.trim()) {
        setIsError(true);
        setMessage("Name is required.");
        return;
      }
      if (!birthdate || !birthdate.toString().trim()) {
        setIsError(true);
        setMessage("Birthdate is required.");
        return;
      }
      const computedAge = calculateAge(birthdate);
      if (isNaN(computedAge) || computedAge <= 0) {
        setIsError(true);
        setMessage("Enter a valid birthdate.");
        return;
      }
    }

    if (!email.trim() || !password.trim()) {
      setIsError(true);
      setMessage("Email and password are required.");
      return;
    }

    if (mode === "login") {
      const nowMs = Date.now();
      const attempts = pruneLoginAttempts(readLoginAttempts(), nowMs);
      if (attempts.length >= LOGIN_RATE_LIMIT_MAX) {
        const retryAfterSeconds = getRetryAfterSeconds(attempts, nowMs);
        setIsError(true);
        setMessage(`Too many login attempts. Try again in ${retryAfterSeconds}s.`);
        return;
      }
      attempts.push(nowMs);
      writeLoginAttempts(attempts);
    }

    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } = await signUpWithEmail(email.trim(), password);
        if (error) throw error;
        setIsError(false);
        setMessage("Sign-up successful. Check your email if confirmation is required.");
        // try to save name and birthdate into user metadata (works if session is active)
        try {
          await supabase.auth.updateUser({ data: { full_name: name, birthdate } })
        } catch (e) {
          // ignore if update fails (e.g., email confirmation required)
        }
        setName("");
        setBirthdate("");
        setEmail("");
        setPassword("");
      } else {
        const { data, error } = await signInWithEmail(email.trim(), password);
        if (error) throw error;
        setIsError(false);
        setMessage("Login successful.");
        try {
          localStorage.removeItem(LOGIN_RATE_LIMIT_KEY);
        } catch (e) {
          // ignore storage errors
        }
        // persist user id for legacy endpoints that require user_id
        try {
          const user = (await getUser()) || data?.user;
          if (user?.id) {
            localStorage.setItem('mindscape_user_id', user.id);
          }
        } catch (e) {
          // ignore
        }
        navigate('/');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 72px)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        background: "linear-gradient(135deg, #040d27, #5a83c1, #07246a)",
        padding: "1.25rem",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          flex: "1 1 420px",
          minHeight: 500,
          maxWidth: 800,
          borderRadius: 14,
          border: "1px solid rgba(245, 158, 11, 0.25)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.09)",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(130deg, rgba(4, 13, 39, 0.8), rgba(15, 23, 42, 0.72)), url(${heroImage})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#577ced",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            padding: "0.4rem",
            color: "#e2e8f0",
            width: "100%",
            background: "linear-gradient(0deg, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.02))",
          }}
        >
          <h1 style={{ margin: 0, color: "#f59e0b", fontSize: "1.8rem" }}>MindScape</h1>
          <p style={{ marginTop: "0.45rem", marginBottom: 0, lineHeight: 2.5 }}>
            Your calm space starts here. Sign up or log in to continue your mood journey.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleAuth}
        style={{
          flex: "1 1 360px",
          maxWidth: 420,
          background: "rgba(22, 33, 62, 0.85)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          borderRadius: 14,
          padding: "1.5rem",
          color: "#e2e8f0",
          backdropFilter: "blur(6px)",
          alignSelf: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            marginBottom: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: 8,
              border: mode === "signup" ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid #334155",
              background: mode === "signup" ? "#f59e0b" : "#0f172a",
              color: mode === "signup" ? "#0f172a" : "#e2e8f0",
              fontWeight: mode === "signup" ? 700 : 600,
              cursor: "pointer",
            }}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={{
              flex: 1,
              padding: "0.6rem",
              borderRadius: 8,
              border: mode === "login" ? "1px solid rgba(245, 158, 11, 0.5)" : "1px solid #334155",
              background: mode === "login" ? "#f59e0b" : "#0f172a",
              color: mode === "login" ? "#0f172a" : "#e2e8f0",
              fontWeight: mode === "login" ? 700 : 600,
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            style={{
              width: "100%",
              marginTop: "0.6rem",
              padding: "0.7rem",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0b1220",
              color: "#94a3b8",
              cursor: "pointer",
            }}
          >
            Continue with Google
          </button>
        </div>

        <h2 style={{ marginTop: 0, marginBottom: "1rem", color: "#f59e0b" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>
        {mode === "signup" && (
          <>
            <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="birthdate">
              Birthdate
            </label>
            <input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              style={{
                width: "100%",
                marginBottom: "0.9rem",
                padding: "0.7rem",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
              }}
            />
            <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              style={{
                width: "100%",
                marginBottom: "0.9rem",
                padding: "0.7rem",
                borderRadius: 8,
                border: "1px solid #334155",
                background: "#0f172a",
                color: "#e2e8f0",
              }}
            />
          </>
        )}
        <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          style={{
            width: "100%",
            marginBottom: "0.9rem",
            padding: "0.7rem",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        />

        <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          style={{
            width: "100%",
            marginBottom: "1rem",
            padding: "0.7rem",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: 10,
            border: "none",
            background: loading ? "#64748b" : "#f59e0b",
            color: "#0f172a",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (mode === "signup" ? "Registering..." : "Logging in...") : mode === "signup" ? "Register" : "Login"}
        </button>

        {message && (
          <p
            style={{
              marginTop: "0.9rem",
              color: isError ? "#fca5a5" : "#86efac",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Register;
 
