import { useState } from "react";
import { apiUrl } from "../services/api";
import heroImage from "../assets/regbg.jpg";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signup");

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setIsError(true);
      setMessage("Username and password are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const endpoint = mode === "signup" ? "/register" : "/login";
      const actionText = mode === "signup" ? "Registration" : "Login";

      const response = await fetch(apiUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || `${actionText} failed. Try again.`);
      }

      setIsError(false);
      setMessage(data?.message || `${actionText} successful.`);
      if (mode === "signup") {
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message || "Something went wrong.");
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
          minHeight: 520,
          maxWidth: 640,
          borderRadius: 14,
          border: "1px solid rgba(245, 158, 11, 0.25)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          position: "relative",
          overflow: "hidden",
          backgroundImage: `linear-gradient(130deg, rgba(4, 13, 39, 0.8), rgba(15, 23, 42, 0.72)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            padding: "1.4rem",
            color: "#e2e8f0",
            width: "100%",
            background: "linear-gradient(0deg, rgba(2, 6, 23, 0.8), rgba(2, 6, 23, 0.02))",
          }}
        >
          <h2 style={{ margin: 0, color: "#f59e0b", fontSize: "1.8rem" }}>MindScape Auth</h2>
          <p style={{ marginTop: "0.45rem", marginBottom: 0, lineHeight: 1.5 }}>
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

        <h2 style={{ marginTop: 0, marginBottom: "1rem", color: "#f59e0b" }}>
          {mode === "signup" ? "Create Account" : "Welcome Back"}
        </h2>

        <label style={{ display: "block", marginBottom: "0.35rem" }} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
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
