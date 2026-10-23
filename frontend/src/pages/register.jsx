import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  signUpWithEmail,
  signInWithEmail,
  resetPasswordForEmail,
  signInWithGoogle,
  getUser,
  supabase,
} from "../services/supabaseClient";
import { fetchJson } from "../services/api";
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
  const [confirmPassword, setConfirmPassword] = useState("");

  const routeAfterLogin = useCallback(async () => {
    try {
      const data = await fetchJson('/api/onboarding');
      if (data?.onboarding?.completed) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (e) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
    const recoveryLink = window.location.hash.includes("type=recovery");
    if (recoveryLink) {
      setMode("reset");
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        setMode("reset");
        setMessage("");
      }
    });

    ;(async () => {
      try {
        const user = await getUser();
        if (mounted && user?.id && !recoveryLink) {
          await routeAfterLogin();
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [navigate, routeAfterLogin]);

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

    if (mode === "reset") {
      if (!password.trim() || !confirmPassword.trim()) {
        setIsError(true);
        setMessage("Enter and confirm your new password.");
        return;
      }
      if (password !== confirmPassword) {
        setIsError(true);
        setMessage("Passwords do not match.");
        return;
      }
    } else if (mode === "signup") {
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

    if (mode !== "reset" && !email.trim()) {
      setIsError(true);
      setMessage("Email is required.");
      return;
    }
    if (mode !== "forgot" && !password.trim()) {
      setIsError(true);
      setMessage("Password is required.");
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
      if (mode === "forgot") {
        const { error } = await resetPasswordForEmail(email.trim().toLowerCase());
        if (error) throw error;
        setIsError(false);
        setMessage("If an account exists for this email, a password reset link has been sent.");
        return;
      }

      if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setIsError(false);
        setMessage("Password updated. You can now log in.");
        setPassword("");
        setConfirmPassword("");
        setMode("login");
        return;
      }

      if (mode === "signup") {
        const { data, error } = await signUpWithEmail(email.trim().toLowerCase(), password);
        if (error) throw error;
        if (!data?.user || (data.user.identities && data.user.identities.length === 0)) {
          throw new Error("An account with this email already exists. Please log in or use Forgot password.");
        }
        setIsError(false);
        setMessage("Sign-up successful. Check your email if confirmation is required.");
        // try to save name and birthdate into user metadata (works if session is active)
        try {
          await supabase.auth.updateUser({ data: { full_name: name, birthdate } })
        } catch (e) {
          // ignore if update fails (e.g., email confirmation required)
        }
        try {
          const createdUser = data?.user;
          if (createdUser?.id) {
            localStorage.setItem('mindscape_user_id', createdUser.id);
          }
        } catch (e) {
          // ignore storage errors
        }
        setName("");
        setBirthdate("");
        setEmail("");
        setPassword("");
        navigate('/onboarding');
      } else {
        const { data, error } = await signInWithEmail(email.trim().toLowerCase(), password);
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
        await routeAfterLogin();
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
      className="login-page"
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
        className="login-hero login-page-hero"
        style={{
          flex: "1 1 420px",
          minHeight: 500,
          maxWidth: 800,
          borderRadius: 14,
          border: "1px solid rgba(245, 158, 11, 0.25)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.09)",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(130deg, rgba(2, 6, 23, 0.72), rgba(8, 15, 45, 0.58)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundColor: "#577ced",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="login-hero-content"
          style={{
            padding: "1.25rem 1.5rem",
            color: "#e2e8f0",
            width: "min(88%, 430px)",
            textAlign: "center",
          }}
        >
          <h1
            className="login-hero-title"
            style={{
              margin: 0,
              color: "#ffd166",
              fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
              letterSpacing: "0.06em",
              lineHeight: 1.05,
            }}
          >
            MindScape
          </h1>
          <p style={{ marginTop: "0.65rem", marginBottom: 0, lineHeight: 1.6 }}>
            Your calm space starts here. Sign up or log in to continue your mood journey.
          </p>
        </div>
      </div>

      <form
        className="login-form"
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
          {mode !== "reset" && <button
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
          }
          {mode !== "reset" && <button
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
          }
        </div>

        {mode !== "forgot" && mode !== "reset" && <div style={{ marginBottom: "1rem" }}>
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
        </div>}

        <h2 style={{ marginTop: 0, marginBottom: "1rem", color: "#f59e0b" }}>
          {mode === "signup" ? "Create Account" : mode === "forgot" ? "Reset Password" : mode === "reset" ? "Set New Password" : "Welcome Back"}
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

        {mode !== "forgot" && <>
          <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="password">
            {mode === "reset" ? "New password" : "Password"}
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
          {mode === "reset" && <input
            type="password"
            aria-label="Confirm new password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            style={{
              width: "100%",
              marginBottom: "1rem",
              padding: "0.7rem",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
            }}
          />}
        </>}

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
          {loading
            ? mode === "signup" ? "Registering..." : mode === "forgot" ? "Sending..." : mode === "reset" ? "Updating..." : "Logging in..."
            : mode === "signup" ? "Register" : mode === "forgot" ? "Send reset link" : mode === "reset" ? "Update password" : "Login"}
        </button>

        {mode === "login" && (
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setMessage("");
            }}
            style={{
              width: "100%",
              marginTop: "0.75rem",
              border: "none",
              background: "transparent",
              color: "#fbbf24",
              cursor: "pointer",
            }}
          >
            Forgot password?
          </button>
        )}

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
 
