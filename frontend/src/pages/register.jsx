import { useState } from "react";
import { apiUrl } from "../services/api";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setIsError(true);
      setMessage("Username and password are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(apiUrl("/register"), {
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
        throw new Error(data?.message || "Registration failed. Try again.");
      }

      setIsError(false);
      setMessage(data?.message || "Registration successful.");
      setUsername("");
      setPassword("");
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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #040d27, #5a83c1, #07246a)",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(22, 33, 62, 0.85)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
          borderRadius: 14,
          padding: "1.5rem",
          color: "#e2e8f0",
          backdropFilter: "blur(6px)",
        }}
      >
        
        <h2 style={{ marginTop: 0, marginBottom: "1rem", color: "#f59e0b" }}>
          Create Account
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
          {loading ? "Registering..." : "Register"}
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
