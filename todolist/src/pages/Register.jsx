import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { setSession } from "../lib/auth";
import "../styles/Auth.css";

export default function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || password.length < 6 || busy) return;

    setBusy(true);
    setError("");
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: { username, password },
      });
      setSession({ token: data.token, username: data.user.username });
      nav("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authHeader">
          <div className="authMark" aria-hidden="true" />
          <div>
            <h1 className="authTitle">Create account</h1>
            <p className="authSub">Register to save your todos in MongoDB.</p>
          </div>
        </div>

        {error ? (
          <div className="authAlert" role="alert">
            {error}
          </div>
        ) : null}

        <form className="authForm" onSubmit={onSubmit}>
          <label className="authLabel">
            Username
            <input
              className="authInput"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="abhinav"
              autoComplete="username"
              disabled={busy}
            />
          </label>

          <label className="authLabel">
            Password (min 6 chars)
            <input
              className="authInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="new-password"
              disabled={busy}
            />
          </label>

          <button className="authPrimary" type="submit" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="authFooter">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

